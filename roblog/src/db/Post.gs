package db

uses javax.persistence. *
uses java.lang.Long
uses java.util.Date

@Entity
public class Post  implements roblogTable {
  public static final var titleLength : int = 20

  @Id
  @GeneratedValue
  var _id : Long as Id

  @Temporal(TemporalType.TIMESTAMP)
  var _posted : Date as Posted

  @Column(:unique=true, :length = titleLength)
  var _title : String as Title

  var _body : String as Body

}