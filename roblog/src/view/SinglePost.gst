<%@ extends ronin.RoninTemplate %>
<%@ params(aPost : db.Post, showPost()) %>
<% uses db.* %>
<% uses controller.* %>
<% uses org.hibernate.HibernateException %>

<% showPost()  %>
<%
    var comments : List<Comment> = {}
    try {
      var ses = DatabaseFrontEndImpl.currentSession()
      ses.beginTransaction()
      var query = ses.createQuery("from Comment c where c.commentPost = " + aPost.Id + " order by c.posted desc" )
      comments = query.list() as List<Comment>
      ses.getTransaction().commit()
      DatabaseFrontEndImpl.closeSession()
    }  catch (e : HibernateException ) {
      DatabaseFrontEndImpl.rollback();
      throw e
    }

 %>
<% for(comment in comments) { %>
    <div class="comment">
    <div class="commentAuthor">${comment.Name} - ${comment.Posted}</div>
    <div class="commentBody">${comment.Text}</div>
    </div>
<% } %>

<div class="newCommentForm">
<% using(target(PostCx#addComment(Post, Comment))) { %>
  <form action="${TargetURL}" method="post">
    <input type="hidden" name="${n(aPost)}" value="${aPost.Id}">
    ${Strings.Name}: <input type="text" name="${n(Comment#Name)}"><br>
    ${Strings.Comment}:<br>
    <textarea name="${n(Comment#Text)}" rows=5 columns=60></textarea><br>
    <input type="submit">
  </form>
<% } %>
</div>