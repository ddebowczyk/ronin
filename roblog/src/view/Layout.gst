<%@ extends ronin.RoninTemplate %>
<%@ params(title : String, content()) %>
<% uses db.* %>
<% uses controller.* %>
<% uses org.hibernate.HibernateException %>

<html>
  <head>
    <link href="/public/blog.css" rel="stylesheet" type="text/css">
    <meta http-equiv="X-XRDS-Location" content="${urlFor(OpenID#xrds())}"/>
    <%
      var blogTitle = ""
      try {
        var ses = DatabaseFrontEndImpl.currentSession()
        ses.beginTransaction()
        var query = ses.createQuery("from BlogInfo")
        query.setMaxResults(1)
        if(!query.list().Empty) {
          blogTitle = (query.list().get(0) as BlogInfo).Title
        }
        ses.getTransaction().commit()
        DatabaseFrontEndImpl.closeSession()
      }  catch (e : HibernateException ) {
        DatabaseFrontEndImpl.rollback();
        throw e
      }
     %>
    <title>${blogTitle} : ${h(title)}</title>
  </head>
  <body>
    <div id="blogTitle">${blogTitle}</div>
    <div id="sidebar">
      <div class="sidebarLink"><a href="${urlFor(PostCx#recent(0))}">${Strings.AllPosts}</a></div>
      <% if (AuthManager.CurrentUserName == "admin") { %>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#newPost())}">${Strings.WriteNew}</a></div>
          <div class="sidebarLink"><a href="${urlFor(AdminCx#setup())}">${Strings.BlogSetup}</a></div>
      <% } %>
      <div id="loginLogout">
      <% if (AuthManager.CurrentUserName != null) { %>
          ${Strings.LoggedIn.formatMessage({AuthManager.CurrentUserName})} - <a href="${urlFor(AdminCx#logout())}">${Strings.Logout}</a>
      <% } else { %>
          <a href="${urlFor(AdminCx#login())}">${Strings.Login}</a>
      <% } %>
      </div>
    </div>
    <div id="content"><% content() %></div>
    <div id="footer">${util.FooterInfo.getFooterInfo()}</div>
  </body>
</html>
