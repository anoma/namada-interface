export * from "./shared/shared";

export interface PasswordService {
  setPassword(password: string): void;

  clearPassword(): void;

  getPassword(): string | undefined;
}

export let service: PasswordService | undefined;

export function setService(_service: PasswordService) {
  service = _service;
}
export function getService(): PasswordService | undefined {
  return service;
}
