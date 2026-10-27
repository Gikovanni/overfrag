import { test, expect } from '@playwright/test';

test('renderiza a arena WebGL, captura o mouse e move a câmera com WASD', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Conectar à arena' }),
  ).toBeEnabled();
  const canvas = page.locator('canvas');
  await canvas.click();
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement?.tagName))
    .toBe('CANVAS');
  const before = await canvas.screenshot();
  await page.keyboard.down('KeyW');
  const movement = page.getByTestId('movement');
  await expect
    .poll(async () =>
      Number((await movement.textContent())?.match(/([\d.]+) m\/s/)?.[1] ?? 0),
    )
    .toBeGreaterThan(4);
  const after = await canvas.screenshot({
    path: testInfo.outputPath('walking.png'),
  });
  await page.keyboard.up('KeyW');
  expect(before.equals(after)).toBe(false);
  await testInfo.attach('arena-em-movimento', {
    body: after,
    contentType: 'image/png',
  });
  await page.keyboard.press('Escape');
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement === null))
    .toBe(true);
  await expect
    .poll(async () =>
      Number(
        (await movement.textContent())?.match(/([\d.]+) m\/s/)?.[1] ?? 100,
      ),
    )
    .toBeLessThan(0.2);
  expect(errors).toEqual([]);
});

test('executa sprint, slide, jump, land e crouch usando teclado real do navegador', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Conectar à arena' }),
  ).toBeEnabled();
  await page.locator('canvas').click();
  await expect
    .poll(() => page.evaluate(() => document.pointerLockElement?.tagName))
    .toBe('CANVAS');
  const movement = page.getByTestId('movement');
  await page.keyboard.down('KeyW');
  await page.keyboard.down('Shift');
  await expect
    .poll(async () =>
      Number((await movement.textContent())?.match(/([\d.]+) m\/s/)?.[1] ?? 0),
    )
    .toBeGreaterThan(7);
  await page.keyboard.press('KeyC');
  await expect(movement).toContainText('Deslizando');
  await page.keyboard.press('Space');
  await expect(movement).toContainText('No ar');
  await page.keyboard.up('KeyW');
  await page.keyboard.up('Shift');
  await expect(movement).toContainText('No chão');
  await page.keyboard.down('Control');
  await expect(movement).toContainText('Agachado');
  await page.keyboard.up('Control');
  await expect(movement).toContainText('No chão');
});

test('conecta duas interfaces e volta ao treino local ao sair', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const errors: string[] = [];
  try {
    const first = await context.newPage();
    const second = await context.newPage();
    for (const [index, page] of [first, second].entries()) {
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173');
      await expect(
        page.getByRole('button', { name: 'Conectar à arena' }),
      ).toBeEnabled();
      await page.getByLabel('Nome do jogador').fill(`Browser ${index}`);
      await page.getByRole('button', { name: 'Conectar à arena' }).click();
      await expect(
        page.getByRole('button', { name: 'Sair da sala' }),
      ).toBeVisible();
    }
    for (const page of [first, second])
      await expect(page.locator('.stats')).toContainText('2 / 12');
    expect(await first.locator('.room').textContent()).toBe(
      await second.locator('.room').textContent(),
    );
    await expect(first.getByTestId('movement')).toContainText('Sala estática');
    await first.bringToFront();
    await first.getByRole('button', { name: 'Sair da sala' }).click();
    await expect(
      first.getByRole('button', { name: 'Conectar à arena' }),
    ).toBeEnabled();
    await expect(first.locator('.arena-footer')).toContainText('Treino local');
    await expect(second.locator('.stats')).toContainText('1 / 12');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
