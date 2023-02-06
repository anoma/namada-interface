import { PasswordService, setService } from "@anoma/shared";

export class Pw implements PasswordService {
  private static instance: Pw;
  private password?: string;

  public static getInstance(): Pw {
    if (!Pw.instance) {
      Pw.instance = new Pw();
      setService(Pw.instance);
    }

    return Pw.instance;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  clearPassword(): void {
    this.password = undefined;
  }

  getPassword(): string | undefined {
    return this.password;
  }
}
