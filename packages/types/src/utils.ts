export type JsonCompatibleArray = (string | number | boolean)[];
export type JsonCompatibleDictionary = {
  [key: string]: string | JsonCompatibleArray;
};
