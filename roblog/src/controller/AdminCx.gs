package controller

uses db.BlogInfo
uses db.DatabaseFrontEndImpl
uses db.Post
uses db.User
uses org.hibernate.HibernateException
uses ronin.NoAuth
uses ronin.RoninController

uses java.lang.System
uses java.sql.Timestamp

class AdminCx extends RoninController {

  function newPost() {
    view.Layout.render(Writer, "New post", \ -> view.EditPost.render(Writer, new Post()))
  }

  function editPost(post : Post) {
    view.Layout.render(Writer, "Edit post", \ -> view.EditPost.render(Writer, post))
  }

  function deletePost(post : Post) {
    try{
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.createQuery("delete from Comment c where c.commentPost = " + post.Id).executeUpdate()
      var res = ses.get("db.Post", post.Id)
      ses.delete(res)
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    redirect(PostCx#recent(0))
  }

  function savePost(post : Post) {
    try {
      post.Posted = new Timestamp(System.currentTimeMillis())
      if(post.Title != null && post.Title.length > Post.titleLength ) {
        post.Title = post.Title.substring(0, Post.titleLength)
      }
      post.Body = post.Body == null ? "" : post.Body
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      if(post.Id == null) {
        ses.save(post)
      } else {
        ses.update(post)
      }
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
       DatabaseFrontEndImpl.rollback();
       throw e
    }
    redirect(PostCx#viewPost(post))
  }

  function setup() {
    var blogInfo : BlogInfo
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("from BlogInfo")
      query.setMaxResults(1)
      if(!query.list().Empty) {
        blogInfo = query.list().get(0) as BlogInfo
      } else {
        blogInfo = new BlogInfo()
      }
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    view.Layout.render(Writer, "Setup", \ -> view.Setup.render(Writer, blogInfo))
  }

  function editInfo(blogInfo : BlogInfo) {
    if(blogInfo.Title != null && blogInfo.Title.length > BlogInfo.titleLength ) {
      blogInfo.Title = blogInfo.Title.substring(0, BlogInfo.titleLength)
    }
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.update(blogInfo)
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    redirect(#setup())
  }

  @NoAuth
  function login() {
    view.Layout.render(Writer, "Login", \ -> view.Login.render(Writer))
  }

  @NoAuth
  function doLogin(name : String, pass : String) {
    if(AuthManager.login(name, pass)) {
      postLoginRedirect(PostCx#recent(0))
    } else {
      redirect(#login())
    }
  }

  function logout() {
    AuthManager.logout()
    redirect(#login())
  }

  function createUser(name : String, pass : String) {
    if(name != null && name.length > User.nameLength ) {
      name = name.substring(0, User.nameLength)
    }
    var hashAndSalt = AuthManager.getPasswordHashAndSalt(pass)
    var user = new User() {:Name = name, :Hash = hashAndSalt.First, :Salt = hashAndSalt.Second}
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.save(user)
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
    redirect(#login())
  }

}
