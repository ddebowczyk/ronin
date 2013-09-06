package db

uses javax.persistence. *
uses java.lang.Long

@Entity
@Table(:name="rbUser")
public class User  implements roblogTable {
  public static final var nameLength : int = 20

  @Id
  @GeneratedValue
  var _id : Long  as Id

  @Column(:unique=true, :length = nameLength)
  var _name : String as Name

  var _hash : String as Hash

  var _salt : String as Salt
}