package db

uses javax.persistence. *
uses java.lang.Long
uses java.util.Date

@Entity
public class Comment  implements roblogTable {
  public static final var nameLength : int = 20

  @Id
  @GeneratedValue
  var _id : Long as Id

  @ManyToOne
  var commentPost : Post as CommentPost

  @Temporal(TemporalType.TIMESTAMP)
  var _posted : Date as Posted

  @Column(:length = nameLength)
  var _name : String as Name

  var _text : String as Text
}