package ronin.db

uses gw.lang.reflect.IType

interface IDatabaseFrontEnd {
  function getInstance( type: IType, id: String ) : Object
  function getId( instance: Object ) : String
  function startDB()
}