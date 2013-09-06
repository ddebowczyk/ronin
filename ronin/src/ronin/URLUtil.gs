package ronin

uses gw.lang.reflect.features.*

uses java.net.URLEncoder
uses java.lang.StringBuilder
uses ronin.db.DatabaseFrontEnd

/**
 *  Utility class for URL generation.  Should not be used directly.
 */
class URLUtil {

  static function urlFor(target : MethodReference) : String {
    var prefix = Ronin.CurrentRequest.Prefix
    var httpsMethodAnnotation = target.MethodInfo.getAnnotation(HttpsOnly)?.Instance
    if(httpsMethodAnnotation != null) {
      prefix = "https" + prefix.substring(prefix.indexOf(":"))
    }
    var httpsTypeAnnotation = target.RootType.TypeInfo.getAnnotation(HttpsOnly)?.Instance
    if(httpsTypeAnnotation != null) {
      prefix = "https" + prefix.substring(prefix.indexOf(":"))
    }
    var url : StringBuilder
    if(prefix != null) {
      url = new StringBuilder(prefix)
    } else {
      url = new StringBuilder()
    }
    url.append(target.MethodInfo.OwnersType.RelativeName).append("/").append(target.MethodInfo.DisplayName)
    if(target.MethodInfo.Parameters.HasElements) {
      url.append("?")
      for(param in target.MethodInfo.Parameters index i) {
        var argValue = target.BoundValues == null ? null : target.BoundValues[i]
        if(param.FeatureType.Array) {
          var arrayType = param.FeatureType
          if(argValue != null) {
            var arrayLength = arrayType.getArrayLength(argValue)
            for(j in 0..|arrayLength) {
              var componentValue = arrayType.getArrayComponent(argValue, j)
              if(componentValue != null) {
                if(i > 0 or j > 0) {
                  url.append("&")
                }
                var stringValue = getStringValue(componentValue)
                url.append(URLEncoder.encode(param.Name, "UTF-8")).append("[").append(j).append("]").append("=").append(URLEncoder.encode(stringValue.toString(), "UTF-8"))
              }
            }
          }
        } else {
          if(argValue != null) {
            if(i > 0) {
              url.append("&")
            }
            var stringValue = getStringValue(argValue)
            url.append(URLEncoder.encode(param.Name, "UTF-8")).append("=").append(URLEncoder.encode(stringValue.toString(), "UTF-8"))
          }
        }
      }
    }
    return url.toString()
  }

  private static function getStringValue(argValue : Object) : String {
    return DatabaseFrontEnd.getId( argValue ) ?: argValue.toString()
  }

  static function baseUrlFor(target : MethodReference) : String {
    return "${Ronin.CurrentRequest.Prefix?:""}${target.MethodInfo.OwnersType.RelativeName}/${target.MethodInfo.DisplayName}"
  }

}