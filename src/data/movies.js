const movies = [

    {
        id: 1,
        title: "Prakambanam",
        language: "malayalam",
        genre: "comedy/Horror",
        poster: "/posters/prakambanam.avif",
        images: ["/sliders/prakambanam.jpg"],
        category: "in_theatres",
        keyDetail: "comedy,Horror.",
        platform: null,
        price: 180,
        rating: 9.7,
        votes: "434+ Votes",
        likedPercent: 96,
        certification: "UA13+",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],

        description: "In a lively Ernakulam college hostel, three friends juggle politics, pranks, and the madness of student life. But when an unexpected twist unsettles their carefree world, comedy and chaos spiral in ways they never imagined.",

    },
    {
        id: 2,
        title: "Chatha Pacha:The Ring of Rowdies",
        language: "Malayalam",
        category: "in_theatres",
        genre: "Action/comedy/Thriller.",
        keyDetail: "Action/comedy/Thriller.",
        poster: "/posters/chatha-pacha.avif",
        images: [
            "/sliders/chatha-pacha-.avif",
        ],
        price: 250,
        rating: 9.3,
        votes: "205K+",
        likedPercent: 95,
        certification: "UA13+",
        description: "Chatha Pacha: The Ring of Rowdies is a high-energy action-comedy set in Fort Kochi, where a ragtag group of ex-convicts forms a wrestling club that sparks rivalries and attracts the law. As showdowns heat up inside and outside the ring, its not just about fame, its about survival, brotherhood, and redemption.",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },

    {
        id: 3,
        title: "Valathu Vasathe Kallan",
        language: "malayalam",
        category: "in_theatres",
        keyDetail: "Crime,Drama,Thriller",
        platform: null,
        price: 180,
        poster: "/posters/valathu-vasathe-kallan.avif",
        // images: ["/sliders/haal-malayalam-slider.jpg"],
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 94,
        certification: "UA13+",
        genre: "Crime,Drama,Thriller",
        description: "When a day spins dangerously out of control, Samuel Joseph drags veteran Circle Inspector Antony Xavier into the most critical case of his career. With time slipping away, Antony must race against the clock to uncover the truth before it's too late.",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 4,
        title: "Magic Mushrooms",
        language: "MALAYALAM",
        category: "in_theatres",
        keyDetail: "Comdey/Family/Fantasy",
        genre: "comedy/family",
        platform: null,
        price: 180,
        poster: "/posters/magic-mushrooms.avif",
        rating: 7.6,
        votes: "6.6K+ Votes",
        likedPercent: 80.6,
        certification: "U",
        description: "Haunted by childhood loss, a quiet young man from rural Idukki finds love with an introverted woman he meets by chance. When prejudice and misunderstanding threaten to separate them, a heartfelt public confession turns resistance into acceptance and leads them toward a hopeful future",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },

    {
        id: 5,
        title: "Baby Girl",
        language: "Malayalam",
        category: "in_theatres",
        keyDetail: "Crime Thriller (Recent success).",
        platform: null,
        price: 180,
        poster: "/posters/baby_girl.avif",
        rating: 8.6,
        votes: "50.9K+ Votes",
        likedPercent: 83,
        certification: "UA16+",
        genre: "Action, Thriller",
        description: "A routine Kerala Police inquiry in the quiet village of Kottayikonam takes an unexpected turn when a trail of seemingly minor clues unravels a series of disturbing, long-buried cases. As the officers dig deeper, they find themselves confronting mysteries that have haunted the village for years and a web of brilliant, calculated obstructions designed to block every step of their investigation.",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 6,
        title: "Shelter",
        category: "in_theatres",
        keyDetail: "Action,Crime,Thriller",
        description:
            "A recluse on a remote Scottish island rescues a girl from the sea, unleashing a perilous sequence of events that culminate in an attack on his home, compelling him to face his turbulent history.",

        poster: "/posters/shelter.avif",
        price: 250,
        rating: 9.7,
        votes: "205K+",
        likedPercent: 85,
        certification: "A",
        genre: "Action, Thriller",
        language: "ENGLISH",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 7,
        title: "Thalaivar Thambi Thalaimaiyil",
        language: "TAMIL",
        category: "in_theatres",
        keyDetail: "Comedy/Drama/Family",
        platform: null,
        price: 180,
        poster: "/posters/thalaivar-thambi-thalaimaiyil.avif",
        rating: 8.8,
        votes: "17.1K+ Votes",
        likedPercent: 90,
        certification: "U",
        description: "Jeevarathinam, a village panchayat member, is invited to oversee a wedding, only to be drawn into a simmering family conflict rooted in power and buried grudges. As the night unfolds, he is forced to confront the true weight of leadership and whether he can resolve a crisis spiralling out of control",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 8,
        title: "Zootopia 2",
        industry: "Hollywood",
        language: "English",
        category: "ott",
        keyDetail: "Comedy/Adventure/Animation/Comedy",
        platform: null,
        price: 180,
        poster: "/posters/zootopia-2.avif",
        rating: 9.1,
        votes: "15.7K+ Votes",
        likedPercent: 93,
        certification: "UA7+",
        description: "Get ready to race back into the wild, colorful world of Zootopia, where animals talk, hustle, and chase their dreams - just like us!Whether you loved the first Zootopia or are diving in for the first time, this is one ride you don't want to miss!",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 9,
        title: "Dheeram",
        language: "Malayalam",
        category: "ott",
        keyDetail: "Mystery/Psychological/Thriller",
        platform: null,
        price: 180,
        poster: "/posters/dheeram.avif",
        rating: 7.9,
        votes: "1.7K+ Votes",
        likedPercent: 73,
        certification: "A",
        genre: "Mystery/Psychological/Thriller",
        description: "When a series of mysterious murders in Calicut reveals a chilling pattern, encounter specialist ACP Stallin Joseph uncovers a vengeful psycho killer's deadly plan. As he pieces together the twisted truth, Stallin must make a harrowing choice to become both judge and executioner in his pursuit of justice for a grieving parent.",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },
    {
        id: 10,
        title: "Tere Ishk Mein",
        language: "Malayalam",
        category: "ott",
        keyDetail: "Romance/Drama .",
        platform: null,
        price: 180,
        poster: "/posters/tere-ishk-mein.avif",
        rating: 8.2,
        votes: "79.7K+ Votes",
        likedPercent: 84,
        certification: "UA16+",
        genre: "Romance",
        description: "Some souls are meant to collide. Some love stories are destined to burn brighter.",
        theatres: [
            {
                name: "PVR Cinemas",
                location: "Bangalore",
                times: ["10:30 AM", "2:00 PM", "6:30 PM"]
            },
            {
                name: "INOX",
                location: "Bangalore",
                times: ["11:00 AM", "3:00 PM", "9:00 PM"]
            },
            {
                name: "Cinepolis",
                location: "Bangalore",
                times: ["1:00 PM", "7:00 PM"]
            }
        ],
    },

   {
        id: 34,
        title: "Sarvam Maya",
        
        category: "ott",
        keyDetail: "Comedy,Drama,Fantasy",
        platform: "Jio Hotstar",
        poster: "/posters/sarvam-maya.avif",
        rating: 9.7,
        votes: "43.7K+ Votes",
        likedPercent: 98,
        certification: "U",
        description: "A young Hindu priest`s life turns upside down when he encounters a ghost. What begins as an unexpected problem soon becomes a journey that challenges his beliefs, his purpose, and everything he thought was real.",
        language: "Malayalam",
        platformUrl: "https://www.hotstar.com/in/movies/sarvam-maya/1271525191/watch",
    },

    {
        id: 11,
        title: "Kaantha",
        industry: "Indian (Multi-Lingual)",
        category: "ott",
        keyDetail: "Drama/Thriller.",
        platform: "Netflix",
        poster: "/posters/Kaantha.jpg",
        rating: 8.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA13+",
        description: "Kaantha is a period drama set in 1950s Madras, directed by Selvamani Selvaraj. Featuring Dulquer Salmaan, Samuthirakani, and Bhagyashri Borse, the film brings a pan-Indian cinematic experience to life.",
        language: "Malayalam",
        platformUrl: "https://www.primevideo.com",
    },
    {
        id: 12,
        title: "Dies Irae",
        category: "ott",
        keyDetail: " Horror/ Thriller.",
        platform: "JioHotstar",
        poster: "/posters/dies irae.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA18+",
        description: "Rohan's affluent lifestyle spirals out of control as he becomes convinced there is a supernatural entity in his home. As he starts to uncover the mystery, he is drawn into unexpected worlds and alliances, along with the horrors that lie ahead.",
        language: "Malayalam",
        genre: "Horror/ Thriller.",
        platformUrl: "https://www.hotstar.com/in/movies/dies-irae/1271511297/watch",
    },
    {
        id: 13,
        title: "Wake Up Dead Man: A Knives Out Mystery",
        industry: "Hollywood",
        category: "ott",
        keyDetail: "Mystery/Thriller.",
        platform: "Netflix",
        poster: "/posters/Wake Up Dead Man.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
        language: "English",
        platformUrl: "https://www.primevideo.com",
    },
    {
        id: 14,
        title: "Single Papa",
        industry: "Indian (Hindi)",
        category: "ott",
        keyDetail: "Comedy/Family Drama.",
        platform: "Netflix",
        poster: "/posters/Single Papa.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
        platformUrl: "https://www.primevideo.com",
    },
    {
        id: 15,
        title: "Saali Mohabbat",
        industry: "Indian (Hindi)",
        category: "ott",
        keyDetail: "Crime Thriller.",
        platform: "ZEE5",
        poster: "/posters/Saali Mohabbat.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
        platformUrl: "https://www.primevideo.com",
    },
    {
        id: 16,
        title: "Feminichi Fathima",
        industry: "Malayalam",
        category: "ott",
        keyDetail: "Drama.",
        platform: "Manorama Max",
        poster: "/posters/Feminichi Fathima.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
        language: "Malayalam",
        
    },
    {
        id: 17,
        title: "Tron: Ares",
        industry: "Hollywood",
        category: "ott",
        keyDetail: "Sci-Fi Action.",
        platform: "Amazon Prime Video",
        poster: "/posters/tron-ares.avif",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
        platformUrl: "https://www.primevideo.com",
    },
    {
        id: 18,
        title: "The Family Man 3",
        industry: "Indian (Hindi)",
        category: "ott",
        keyDetail: "Spy Thriller Series.",
        platform: "Amazon Prime Video",
        poster: "/posters/The Family Man 3.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
    },
    {
        id: 19,
        title: "The Girlfriend",
        industry: "Indian (Telugu)",
        category: "ott",
        keyDetail: "Romantic Drama.",
        platform: "Streaming Now",
        poster: "/posters/the-girlfriend.avif",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
    },
    {
        id: 20,
        title: "Man Vs Baby",
        industry: "Hollywood",
        category: "ott",
        keyDetail: "Comedy.",
        platform: "Netflix",
        poster: "/posters/Man Vs Baby.jpg",
        rating: 9.2,
        votes: "43.7K+ Votes",
        likedPercent: 93,
        certification: "UA16+",
        description: "In the misty hills o",
    },


    {
        id: 21,
        title: "The Odyssey",
        industry: "English",
        category: "coming_soon",
        keyDetail: "Action,Adventure,Drama,Fantasy",
        poster: "/posters/the-odyssey.avif",
        description: " Defy the gods. The Odyssey, a film by Christopher Nolan.",
    },
    {
        id: 22,
        title: "The Raja Saab",
        industry: "Indian (Multi-Lingual)",
        category: "ott",
        keyDetail: "Romantic-horror film starring Prabhas.",
        poster: "/posters/The Raja Saab.jpg",
        platformUrl: "https://www.hotstar.com/in/movies/the-raja-saab/1271527032",
    },
    {
        id: 23,
        title: "The Paradise",
        industry: "kannada",
        category: "coming_soon",
        keyDetail: " Action-Drama.",
        poster: "/posters/the-paradise2.jpg",
        description: "The Paradise is a Period Action-Drama film that is setup in a slum of Secunderabad."
    },
    {
        id: 24,
        title: "Vrusshabha",
        industry: "Malayalam / Indian",
        category: "null",
        keyDetail: "Action,Fantasy,Period,Romantic",
        poster: "/posters/Vrusshabha.jpg",
        language: "Malayalam",
    },
    {
        id: 25,
        title: "Toxic: A Fairy Tale For Grown-ups",
        industry: "Kannada,Hindi,Malayalam,Tamil,Telugu,English",
        category: "Releasing on 19 Mar, 2026",
        keyDetail: "Action,Thriller",
        rating: NaN,
        votes: "400.7K+",
        poster: "/posters/toxic-.avif",
        description: "Directed by Geetu Mohandas, Toxic: A Fairy Tale For Grown-ups features Yash in the lead."
    },
    {
        id: 26,
        title: "Drishyam 3",
        industry: "Malayalam",
        category: "coming_soon",
        keyDetail: "Final chapter of the Drishyam trilogy.",
        poster: "/posters/Drishyam 3.jpg"
    },
    {
        id: 27,
        title: "Five Nights at Freddy's 2",
        industry: "Hollywood",
        category: "null",
        keyDetail: "Horror Sequel (Currently running).",
        platform: null,
        price: 180,
        poster: "/posters/Five Nights at Freddy's 2.jpg",
        rating: 7.7,
        votes: "43.7K+ Votes",
        likedPercent: 75,
        certification: "UA16+",
        description: "One year has passed since the supernatural nightmare at Freddy Fazbear`s Pizza. Former security guard Mike has kept the truth from his 11-year-old sister, Abby, concerning the fate of her animatronic friends. When Abby sneaks out to reconnect with Freddy, Bonnie, Chica and Foxy, she sets into motion a terrifying series of events that reveal dark secrets about the true origin of Freddy`s.",
    },
    {
        id: 28,
        title: "Spider-Man: Beyond the Spider-Verse",
        industry: "Hollywood / Marvel",
        category: "coming_soon",
        keyDetail: "The final film in the Spider-Verse trilogy.",
        poster: "/posters/Spider-Man Beyond the Spider-Verse.jpg"
    },
    {
        id: 29,
        title: "Blade",
        industry: "Hollywood / Marvel",
        category: "coming_soon",
        keyDetail: "MCU reboot starring Mahershala Ali.",
        poster: "/posters/Blade.jpg"
    },
    {
        id: 30,
        title: "Avengers: Doomsday",
        industry: "Hollywood / Marvel",
        category: "coming_soon",
        keyDetail: "MCU anti-hero team-up film.",
        poster: "/posters/avengers-doomsday.avif",
        images: ["/sliders/avengers-doomsday-slider.jpg"],
    },
    {
        id: 31,
        title: "Avengers: Secret Wars",
        industry: "Hollywood / Marvel",
        category: "coming_soon",
        keyDetail: "The biggest MCU multiverse event (2027).",
        poster: "/posters/Avengers Secret Wars.jpg"
    },
    {
        id: 32,
        title: "Spider-Man: Brand New Day",
        industry: "Hollywood / Marvel",
        category: "coming_soon",
        keyDetail: "Confirmed MCU-Spider-Man sequel.",
        poster: "/posters/spider-man-brand-new-day.avif"
    },
    {
        id: 33,
        title: "The Batman Part II",
        industry: "Hollywood / DC",
        category: "coming_soon",
        keyDetail: "Matt Reeves' sequel starring Robert Pattinson (2026).",
        poster: "/posters/the_batman___part_2___.jpg"
    }
];



export default movies;
