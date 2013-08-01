package ronin.db

uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.IType

class DatabaseFrontEnd {
  static var DB : DatabaseFrontEnd
  var _db : IDatabaseFrontEnd

  private static function instance() : DatabaseFrontEnd {
    if( DB == null ) {
      DB = new DatabaseFrontEnd()
    }
    return DB
  }
  private construct() {
    initializeFrontEnd()
  }

  private function initializeFrontEnd() {
    _db = TypeSystem.getByFullName( "db.DatabaseFrontEndImpl" ).TypeInfo.Constructors[0].Constructor.newInstance({}) as IDatabaseFrontEnd
  }

  static function getId( entity: Object ) : String {
    return instance().get().getId( entity )
  }

  static function getInstance( type: IType, id: String ) : Object {
    return instance().get().getInstance( type, id )
  }

  private function get() : IDatabaseFrontEnd {
    return _db;
  }
}