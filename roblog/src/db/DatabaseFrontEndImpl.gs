package db

uses gw.lang.reflect.IType
uses org.hibernate.HibernateException
uses org.hibernate.Session
uses org.hibernate.SessionFactory
uses org.hibernate.cfg.Configuration
uses ronin.IRoninUtils
uses ronin.db.IDatabaseFrontEnd

uses java.lang.ExceptionInInitializerError
uses java.lang.Long
uses java.lang.ThreadLocal
uses java.lang.Throwable

class DatabaseFrontEndImpl implements IDatabaseFrontEnd {
  static var sessionFactory : SessionFactory = null
  static final var session = new ThreadLocal()

  override function getInstance(type: IType, id: String): Object {
    var res : Object
    try {
      var ses = currentSession()
      ses.beginTransaction()
      res = ses.get(type.Name, Long.parseLong(id))
      ses.getTransaction().commit()
      closeSession()
    } catch (e : HibernateException ) {
      rollback();
      res = null
    }
    return res
  }

  override function getId(inst: Object): String {
    var id : Object = null
    if(!(inst typeis roblogTable)) {
      return null
    }
    try {
      var ses = currentSession()
      ses.beginTransaction()
      ses.saveOrUpdate(inst)
      id = ses.getIdentifier(inst)
      ses.getTransaction().commit()
      closeSession()
    } catch (e : HibernateException ) {
      rollback();
      id = ""
    }
    return id.toString()
  }

  override function startDB() {
    try {
      sessionFactory = new Configuration().configure().buildSessionFactory()
    }
    catch (ex: Throwable) {
      IRoninUtils.log("Cannot start the DB")
      throw new ExceptionInInitializerError(ex)
    }
  }

  static function currentSession() : Session {
    var s = session.get() as Session
    if (s == null) {
      s = sessionFactory.openSession()
      session.set(s)
    }
    return s
  }

  static function closeSession()  {
    currentSession().close()
    session.set(null)
  }

  static function rollback() {
    try {
      currentSession().getTransaction().rollback()
    }
    catch (e: HibernateException) {
      IRoninUtils.log("Cannot rollback the transaction")
    }
    try {
      currentSession().close()
    }
    catch (e: HibernateException) {
      IRoninUtils.log("Cannot close the session")
    }
    session.set(null)
  }
}