package controller

uses db.Comment
uses db.DatabaseFrontEndImpl
uses db.Post
uses org.hibernate.HibernateException
uses org.junit.BeforeClass
uses org.junit.Test
uses ronin.RoninTestBase
uses ronin.db.DatabaseFrontEnd
uses ronin.test.RoninTest

uses java.lang.Long
uses java.util.Date
uses java.util.List

class PostTest extends RoninTestBase {

  static var posts : List<Post> = {}

  @BeforeClass static function initSampleData() {
    try{
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.createQuery("delete from Comment").executeUpdate()
      ses.createQuery("delete from Post").executeUpdate()
      posts = {
          new Post() {
              :Title = "Post 1",
              :Body = "Post 1 body",
              :Posted = Date.Yesterday
          },
          new Post() {
              :Title = "Post 2",
              :Body = "Post 2 body",
              :Posted = Date.Today
          }
      }
      posts.each(\p -> ses.save(p))
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
  }

  @Test function testViewPost() {
    var resp = RoninTest.get(PostCx#viewPost(posts[0]))
    var post0 = DatabaseFrontEnd.getInstance(Post.Type, Long.toString(posts[0].Id)) as Post
    assertTrue(resp.WriterBuffer.toString().contains(post0.Title))
    assertTrue(resp.WriterBuffer.toString().contains(post0.Body))
  }

  @Test function testAll() {
    var resp = RoninTest.get(PostCx#all(0))
    var post0 = DatabaseFrontEnd.getInstance(Post.Type, Long.toString(posts[0].Id)) as Post
    assertTrue(resp.WriterBuffer.toString().contains(post0.Title))
    RoninTest.assertResponseContainsLink(resp, PostCx#viewPost(posts[0]))
    assertTrue(resp.WriterBuffer.toString().contains(post0.Title))
    RoninTest.assertResponseContainsLink(resp, PostCx#viewPost(posts[1]))
  }

  @Test function testPrev() {
    var resp = RoninTest.get(PostCx#prev(posts[1]))
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[0]))
  }

  @Test function testNext() {
    var resp = RoninTest.get(PostCx#next(posts[0]))
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[1]))
  }

  @Test function testAddComment() {
    var c = new Comment() {
      :Name = "Fred",
      :Text = "Comment text"
    }
    var resp = RoninTest.post("PostCx/addComment", {
      "post" -> {posts[0].Id as String},
      "comment.Name" -> {c.Name},
      "comment.Text" -> {c.Text}
    })
    RoninTest.assertRedirectTo(resp, PostCx#viewPost(posts[0]))
    assertEquals(1, countComments())
  }

  private function countComments() : int {
    var commentCount = 0
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("select count(*) from Comment")
      commentCount = (query.uniqueResult() as Long).intValue()
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    return commentCount
  }

}