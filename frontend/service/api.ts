export default class API {
  static Auth = class {
    static Register = '/api/auth/register'
    static Login = '/api/auth/login'
    static Refresh = '/api/auth/refresh'
    static Logout = '/api/auth/logout'
  }

  static Anime = 'api/anime/'

  static Tag = 'api/tag/'

  static AnimeEntry = 'api/animeentry/'
  
  static Artist = 'api/artist/'

  static Song = 'api/song/'

  static Quiz = class {
    static Learn = 'api/quiz/learn/'
    static Test = 'api/quiz/test/'
  }
}
