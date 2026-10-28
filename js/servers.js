const AUTOEMBED_SERVERS = [
  {
    "name": "Max",
    "url": "https://ythd.org/embed/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season-episode"
  },
  {
    "name": "Vidpro",
    "url": "https://vixsrc.to/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "V2",
    "url": "https://player2.vidplus.pro/embed/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode",
    "extraParams": "?autoplay=true"
  },
  {
    "name": "Premium",
    "url": "https://player2.vidplus.pro/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode",
    "extraParams": "?autoplay=true&autonext=true&nextbutton=true&poster=true&download=true"
  },
  {
    "name": "4K",
    "url": "https://player.videasy.to/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Vidfast",
    "url": "https://vidfast.vc/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?autoplay=true"
  },
  {
    "name": "Nxsha",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=en&autoplay=true&sub=en"
  },
  {
    "name": "Super",
    "url": "https://vidsuper.net/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Vidcore",
    "url": "https://vidcore.net/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?autoPlay=true&sub=en"
  },
  {
    "name": "Rock",
    "url": "https://vidrock.net/embed/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?autoplay=true&nextbutton=false&episodeselector=false"
  },
  {
    "name": "Primesrc",
    "url": "https://primesrc.me/embed/tv?tmdb=",
    "countryUrl": "https://flagsapi.com/AU/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id&season=season&episode=episode"
  },
  {
    "name": "2Embed",
    "url": "https://www.2embed.stream/embed/tv/",
    "countryUrl": "https://flagsapi.com/AU/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Cinemaos",
    "url": "https://cinemaos.tech/player/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Prime",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=en&autoplay=true&one_server=true&server=OrVid-[Multi-Lang]"
  },
  {
    "name": "Netflix",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=en&autoplay=true&one_server=true&server=ZetPly-[Multi-Lang]"
  },
  {
    "name": "Hotstar",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=en&autoplay=true&one_server=true&server=QsPly-[Multi-Lang]"
  },
  {
    "name": "Vidnest",
    "url": "https://vidnest.fun/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Tongo",
    "url": "https://www.NontonGo.win/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Echo",
    "url": "https://vidlink.pro/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?style",
    "extraParams": "?primaryColor=white&secondaryColor=white&iconColor=white&title=false&poster=true&autoplay=true"
  },
  {
    "name": "Hdmovies",
    "url": "/api/hdmovies/embed?type=tv&id=",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "imdb",
    "urlFormat": "id"
  },
  {
    "name": "NHD",
    "url": "https://nhdapi.com/embed/tv/",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?autoplay=true&autonext=true&audio=true&title=true&download=true"
  },
  {
    "name": "Mplay",
    "url": "https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id&s=season&e=episode"
  },
  {
    "name": "Xpass",
    "url": "https://play.xpass.top/e/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Bravo",
    "url": "https://moviesapi.to/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Vidking",
    "url": "https://www.vidking.net/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode",
    "extraParams": "?autoplay=true&episodeSelector=true"
  },
  {
    "name": "111",
    "url": "https://111movies.net/tv/",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Jade",
    "url": "https://superflixapi.lifestyle/serie/",
    "countryUrl": "https://flagsapi.com/PT/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "French",
    "url": "https://frembed.hair/api/serie.php?id=",
    "countryUrl": "https://flagsapi.com/FR/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id&sa=season&epi=episode"
  },
  {
    "name": "Spanish",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/ES/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=es&autoplay=true&sub=es"
  },
  {
    "name": "Hindi",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=hindi&autoplay=true"
  },
  {
    "name": "Tamil",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=tamil&autoplay=true"
  },
  {
    "name": "Telugu",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=telugu&autoplay=true"
  },
  {
    "name": "Arab",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/SA/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=ar&autoplay=true&sub=ar"
  },
  {
    "name": "French 2",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/FR/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=fr&autoplay=true&sub=fr"
  },
  {
    "name": "Brazil",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/BR/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=pt&autoplay=true&sub=pt"
  },
  {
    "name": "Rus",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/RU/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=ru&autoplay=true&sub=ru"
  },
  {
    "name": "German",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/DE/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=de&autoplay=true&sub=de"
  },
  {
    "name": "Italy",
    "url": "https://vixsrc.to/tv/",
    "countryUrl": "https://flagsapi.com/IT/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=it"
  },
  {
    "name": "Italy 2",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/IT/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=it&autoplay=true&sub=it"
  },
  {
    "name": "Japan",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/JP/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=ja&autoplay=true&sub=ja"
  },
  {
    "name": "Polish",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/PL/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=pl&autoplay=true&sub=pl"
  },
  {
    "name": "PT",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/PT/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=pt&autoplay=true&sub=pt"
  },
  {
    "name": "Thai",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/TH/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=th&autoplay=true&sub=th"
  },
  {
    "name": "Turkish",
    "url": "https://nxsha.space/embed/tv/",
    "countryUrl": "https://flagsapi.com/TR/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?lang=tr&autoplay=true&sub=tr"
  },
  {
    "name": "Rive",
    "url": "https://www.rivestream.app/embed?type=tv&id=",
    "countryUrl": "https://flagsapi.com/GB/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id&season=season&episode=episode"
  },
  {
    "name": "Flicky",
    "url": "https://flicky.host/embed/tv/?id=",
    "countryUrl": "https://flagsapi.com/IN/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode"
  },
  {
    "name": "Peachify",
    "url": "https://peachify.top/embed/tv/",
    "countryUrl": "https://flagsapi.com/US/flat/24.png",
    "idType": "tmdb",
    "urlFormat": "id/season/episode?autoplay=true&sub=English"
  }
];