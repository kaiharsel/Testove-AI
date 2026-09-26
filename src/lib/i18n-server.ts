import { cookies } from "next/headers";
import { DEFAULT_LANG, DICTS, LANG_COOKIE, isLang, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function getDict() {
  return DICTS[await getLang()];
}
