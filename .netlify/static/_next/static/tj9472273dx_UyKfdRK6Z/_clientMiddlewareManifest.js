self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/onboarding(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/onboarding"
  },
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/upload(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/upload"
  },
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/dashboard"
  },
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/history(\\\\.json)?[\\/#\\?]?$",
    "originalSource": "/history"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()