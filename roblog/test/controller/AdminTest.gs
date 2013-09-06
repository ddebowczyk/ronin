package controller

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

class AdminTest extends RoninTestBase {
  static var posts : List<Post>

  @BeforeClass static function initSampleData() {
    DatabaseFrontEnd.startDB()
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

  @Test function testEditPost() {
    RoninTest.doAs(:action = \ -> {
      var resp = RoninTest.get(AdminCx#editPost(posts[0]))
      assertTrue(resp.WriterBuffer.toString().contains("Post 1"))
    }, :userName = "admin")
  }

  @Test function testDeletePost() {
    RoninTest.doAs(:action = \ -> {
      var p = new Post() {
        :Title = "new post",
        :Body = "new post body",
        :Posted = Date.Today
      }
      try {
        var ses = DatabaseFrontEndImpl.currentSession()
        ses.beginTransaction()
        ses.save(p)
        ses.getTransaction().commit()
        DatabaseFrontEndImpl.closeSession()
      } catch (e : HibernateException ) {
        DatabaseFrontEndImpl.rollback();
        throw e
      }
      var pre = countPosts()
      RoninTest.post(AdminCx#deletePost(p))
      assertEquals(pre - 1,countPosts())
      assertFalse(DatabaseFrontEnd.getInstance(Post.Type, p.Id.toString()) != null)
    }, :userName = "admin")
  }

  @Test function testSavePost() {
    RoninTest.doAs(:action = \ -> {
      posts[0].Body = "edited post 1 body"
      RoninTest.post("/AdminCx/savePost", {
        "post" -> {posts[0].Id as String},
        "post.Body" -> {posts[0].Body}
      })
      assertEquals(posts[0].Body, (DatabaseFrontEnd.getInstance(Post.Type, Long.toString(posts[0].Id)) as Post).Body)
    }, :userName = "admin")
  }

  private function countPosts() : int {
    var count = 0
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("select count(*) from Post")
      count = (query.uniqueResult() as Long).intValue()
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    return count
  }
}