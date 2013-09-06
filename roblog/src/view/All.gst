<%@ extends ronin.RoninTemplate %>
<%@ params(page : java.lang.Integer) %>
<% uses controller.PostCx %>
<% uses db.* %>
<% uses org.hibernate.HibernateException %>

<div class="header">${Strings.AllPosts}</div>

<%
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
   for(aPost in posts) { %>
    <div class="postListEntry">
    <a href="${urlFor(PostCx#viewPost(aPost))}">${aPost.Title}</a>
    </div>
<% }
   log(\-> "This is a test of lazy logging...")
 %>

<div class="paging">
<% if (page > 0) { %>
    <a href="${urlFor(PostCx#all(page - 1))}">${Strings.Prev}</a>
<% }
   if ((page == null ? 1 : page + 1) * 20 < posts.size()) { %>
    <a href="${urlFor(PostCx#all(page == null ? 1 : page + 1))}">${Strings.Next}</a>
<% } %>
</div>
