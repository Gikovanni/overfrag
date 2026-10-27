// Tempo em segundos. Backlog limitado para evitar spiral of death após pausas.
export class FixedStep {
  private accumulator = 0;
  droppedSeconds = 0;

  constructor(
    readonly stepSeconds: number,
    readonly maxSteps = 5,
  ) {
    if (
      !Number.isFinite(stepSeconds) ||
      stepSeconds <= 0 ||
      !Number.isInteger(maxSteps) ||
      maxSteps < 1
    ) {
      throw new Error('Passo fixo e limite de substeps devem ser positivos.');
    }
  }

  advance(deltaSeconds: number, update: (dt: number) => void): number {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return 0;
    this.accumulator += deltaSeconds;
    const available = Math.floor((this.accumulator + 1e-10) / this.stepSeconds);
    const steps = Math.min(available, this.maxSteps);
    for (let i = 0; i < steps; i++) update(this.stepSeconds);
    this.droppedSeconds += (available - steps) * this.stepSeconds;
    this.accumulator = Math.max(
      0,
      this.accumulator - available * this.stepSeconds,
    );
    return steps;
  }

  get alpha(): number {
    return this.accumulator / this.stepSeconds;
  }
}
