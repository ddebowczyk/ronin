package config

uses controller.AdminCx
uses controller.OpenID
uses db. *
uses org.hibernate.HibernateException
uses ronin.RoninServlet
uses ronin.config.ApplicationMode
uses ronin.config.DefaultRoninConfig
uses ronin.console.AdminConsole

uses java.lang.System
uses java.sql.Timestamp

class RoninConfig extends DefaultRoninConfig {

  /* Set up your RoninConfig as you see fit */
  construct(m : ApplicationMode, an : RoninServlet) {
    super(m, an)

//    if(m == DEVELOPMENT) {
//      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/devdb"
//    } else if(m == TESTING) {
//      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/testdb"
//    } else if(m == STAGING) {
//      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/stagingdb"
//    } else if(m == PRODUCTION) {
//      db.roblog.Database.JdbcUrl = "jdbc:h2:file:runtime/h2/proddb"
//    }

    DefaultController = controller.PostCx
    initializeDB()

    var getUser = \ name : String -> {
      try {
        var ses = DatabaseFrontEndImpl.currentSession()
        ses.beginTransaction()
        var query = ses.createQuery("from User")
        query.setMaxResults(1)
        var user = query.list().get(0) as User
        ses.getTransaction().commit()
        DatabaseFrontEndImpl.closeSession()
        return user
      } catch (e : HibernateException ) {
        DatabaseFrontEndImpl.rollback();
        throw e
      }
    }

    var getUserByOpenId = \ identity: String, email: String, idProvider: String -> {
      var idToUse: String = null
      if (idProvider == OpenID.GOOGLE) {
        idToUse = email
      } else if (idProvider.startsWith(OpenID.VERISIGN.substring(0, OpenID.VERISIGN.indexOf("{username}")))) {
        idToUse = identity
      } else {
        return null as User
      }
      try {
        var ses = DatabaseFrontEndImpl.currentSession()
        ses.beginTransaction()
        var user : User
        var query = ses.createQuery("from User where name = '${idToUse}'")
        if(query.list().size() > 0) {
          user = query.list().get(0) as User
        } else {
          user = new User() {: Name = idToUse}
          ses.save(user)
        }
        ses.getTransaction().commit()
        DatabaseFrontEndImpl.closeSession()
        return user
      } catch (e : HibernateException ) {
        DatabaseFrontEndImpl.rollback();
        throw e
      }
    }

    AuthManager = createDefaultAuthManager(
      getUser,
      getUserByOpenId,
      User#Name, User#Hash, User#Salt
    )

    LoginRedirect = AdminCx#login()

    AdminConsole.start({"admin"})
//    Filters.add(initFilter(new RoninWebservicesFilter()))
    //Filters.add(new ronin_less.LessFilter())
//    Filters.add(new ronin_coffee.CoffeeFilter())
  }

  private function initializeDB() {
    var admin = new User(){:Name = 'admin', :Hash = 'ilPQ0UXsOZMvdpyKmsqlyGdYc9uXzCREqOb7AL1dv2A=', :Salt = 'ObnNMzW+Ll0LnQP/Hnjb8MsXB8PTaeKKdDPqJvwmtzCQ4EW0FFLsoCqGkInD+rGCKQ42NXFEBSs6TlDQfHuu5xpAT2mX11YhYJv3W8CK5UtMLvYyOg1OzyuSNLsz479wlwmOaZjiketXbPTyQgRMNJIBKk8qHgqLcC08dBVEtT8='}
    var blog = new BlogInfo() {:Title = 'RoBlog'}
    var now = new Timestamp(System.currentTimeMillis())
    var samplePosts = {
                        new Post() {:Title = "My first post", :Body = "Body1", :Posted = now.addMinutes(5)} ,
                        new Post() {:Title = "My second post", :Body = "Body2", :Posted = now.addMinutes(10)} ,
                        new Post() {:Title = "My third", :Body = "Body3", :Posted = now.addMinutes(15)}
                      }
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      ses.save(admin)
      ses.save(blog)
      for(p in samplePosts) {
        ses.save(p)
      }
      var comment = new Comment() {:Name = "Hello", :CommentPost = samplePosts[0], :Text = "World", :Posted = now.addDays(1)}
      ses.save(comment)
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    } catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }
  }

}