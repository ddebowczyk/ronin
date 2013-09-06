package db

uses javax.persistence.Column
uses javax.persistence.Entity
uses javax.persistence.GeneratedValue
uses javax.persistence.Id
uses java.lang.Long

@Entity
public class BlogInfo implements roblogTable {
  public static final var titleLength : int = 20

  @Id
  @GeneratedValue
  var _id : Long as Id

  @Column(:length = titleLength)
  var _title : String as Title
}