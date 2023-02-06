import { getService } from "@anoma/shared";

export class SdkTS {
  private static instance: SdkTS;

  public static getInstance(): SdkTS {
    if (!SdkTS.instance) {
      SdkTS.instance = new SdkTS();
    }

    return SdkTS.instance;
  }

  public getPassword(): string | undefined {
    return getService()?.getPassword();
  }
}
