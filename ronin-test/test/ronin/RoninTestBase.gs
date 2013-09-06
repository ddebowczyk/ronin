package ronin

uses org.junit.BeforeClass
uses ronin.test.RoninTest
uses org.junit.Assert

class RoninTestBase extends Assert {
  @BeforeClass
  static function initRonin() {
    RoninTest.initServlet()
  }
}