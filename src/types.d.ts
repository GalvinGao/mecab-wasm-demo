declare global {
  namespace NodeJS {
    interface Global {
      Mecab: any;
    }
  }
}
export default global;
