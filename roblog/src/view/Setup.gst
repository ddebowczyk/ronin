<%@ extends ronin.RoninTemplate %>
<%@ params(blogInfo : db.BlogInfo) %>
<% uses controller.* %>

<html>
  <title>${Strings.SetupTitle}</title>
  <body>
  <% using(target(AdminCx#editInfo(db.BlogInfo))) { %>
    <form method="post" action="${TargetURL}">
      <% if(blogInfo.Id != null) { %>
          <input type="hidden" name="${n(blogInfo)}" value="${blogInfo.Id}">
      <% } %>
      ${Strings.BlogTitle}: <input type="text" name="${n(blogInfo#Title)}" value="${blogInfo.Title ?: ""}"><br>
      <input type="submit">
    </form>
  <% } %>
  </body>
</html>
