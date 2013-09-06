<%@ extends ronin.RoninTemplate %>
<%@ params(post : db.Post) %>
<% uses controller.* %>

<% using(target(AdminCx#savePost(db.Post))) { %>
  <form method="post" action="${TargetURL}">
    <% if(post.Id != null) { %>
        <input type="hidden" name="${n(post)}" value="${post.Id}">
    <% } %>
    <input type="text" name="${n(post#Title)}" value="${h(post.Title)}"><br>
    <textarea name="${n(post#Body)}" rows=20 columns=80>${h(post.Body)}</textarea><br>
    <input type="submit">
  </form>
<% } %>
