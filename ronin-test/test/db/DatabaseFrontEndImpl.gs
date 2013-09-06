package db

uses ronin.db.IDatabaseFrontEnd
uses gw.lang.reflect.IType

class DatabaseFrontEndImpl implements IDatabaseFrontEnd {
  override function getInstance(type: IType, id: String): Object {
    return null
  }

  override function getId(instance: Object): String {
    return null
  }

  override function startDB() {

  }
}