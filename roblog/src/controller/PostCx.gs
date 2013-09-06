package controller

uses db.Comment
uses db.DatabaseFrontEndImpl
uses db.Post
uses org.hibernate.HibernateException
uses ronin.NoAuth
uses ronin.RoninController

uses java.lang.Long
uses java.lang.System
uses java.sql.Timestamp
uses java.util.List

@NoAuth
class PostCx extends RoninController {

  function index() {
    var numElem = 0
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("select count(*) from BlogInfo")
      numElem = (query.uniqueResult() as Long).intValue()
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    if(numElem == 0) {
      new AdminCx().setup()
    } else {
      all(0)
    }
  }

  function viewPost(p : Post) {
    var prevLink : boolean
    var nextLink : boolean
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query1 = ses.createQuery("select count(*) from Post pos where pos.posted < '${p.Posted}'")
      var query2 = ses.createQuery("select count(*) from Post pos where pos.posted > '${p.Posted}'")
      prevLink = (query1.uniqueResult() as Long).intValue() > 0
      nextLink = (query2.uniqueResult() as Long).intValue() > 0
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    view.Layout.render(Writer, p.Title,
      \ -> view.SinglePost.render(Writer, p,
        \ -> view.ViewPost.render(Writer, p, prevLink, nextLink, AuthManager.CurrentUserName == "admin", true)))
  }

  function all(page : int) {
    view.Layout.render(Writer, "All Posts", \ -> view.All.render(Writer, page))
  }

  function prev(p: Post) {
    var prevPosts : List<Post> = {}
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("from Post pos where pos.posted < '${p.Posted}' order by pos.posted desc")
      prevPosts = query.list() as List<Post>
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    if (!prevPosts.Empty) {
      redirect(#viewPost(prevPosts.get(0)))
    } else {
      redirect(#viewPost(p))
    }
  }

  function next(p : Post) {
    var nextPosts : List<Post> = {}
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("from Post pos where pos.posted > '${p.Posted}' order by pos.posted asc")
      nextPosts = query.list() as List<Post>
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    if (!nextPosts.Empty) {
      redirect(#viewPost(nextPosts.get(0)))
    } else {
      redirect(#viewPost(p))
    }
  }

  function recent(page : int) {
    if(page == null) {
    page = 0
    }
    var posts : List<Post> = {}
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("from Post p order by p.posted desc")
      posts = query.list() as List<Post>
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }

    var more = posts.size() > (page + 1) * 20
    view.Layout.render(Writer, "Recent posts",
      \ -> view.Recent.render(Writer, posts,
        \ post -> view.ViewPost.render(Writer, post, false, false, AuthManager.CurrentUserName == "admin", true),
      more, page))
  }

  function addComment(post : Post, comment : Comment) {
    if(comment.Name != null && comment.Name.length > Comment.nameLength) {
      comment.Name = comment.Name.substring(0, Comment.nameLength)
    }
    comment.Text = comment.Text == null ? "" : comment.Text
    comment.Posted = new Timestamp(System.currentTimeMillis())
    comment.CommentPost = post
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.save(comment)
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    redirect(#viewPost(post))
  }
}