export const MOCK_LISTINGS = [
    {
        id: 1,
        title: "Spacious Room in Mermoz Sacré-Cœur",
        price: "150.000 FCFA",
        location: "Mermoz, Dakar",
        distance: "0.5 km",
        type: "Room",
        image: "https://images.unsplash.com/photo-1600596542815-225bad65dbd8",
        author: {
            id: 101,
            name: "Fatou Diop",
            avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
            backgroundImage: "https://images.unsplash.com/photo-1627483297929-37f416fec7cd?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3",
            age: 24,
            gender: "Female",
            bio: "Student at UCAD. Looking for a calm roommate to share my apartment in Mermoz. I love cooking Thieboudienne on Sundays!"
        },
        postedAt: "2j ago",
        description: "Chambre spacieuse disponible dans un appartement à Mermoz. Près de la VDN et Auchan. \n\nLoyer 150.000 FCFA charges incluses (Eau, Electricité, WiFi).\n\nIdéal pour étudiant ou jeune professionnel."
    },
    {
        id: 2,
        title: "Modern Studio at Les Almadies",
        price: "300.000 FCFA",
        location: "Almadies, Dakar",
        distance: "2.1 km",
        type: "Studio",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        author: {
            id: 102,
            name: "Moussa Sow",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            backgroundImage: "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3",
            age: 28,
            gender: "Male",
            bio: "Consultant, often traveling. Looking for someone clean to sublet my studio when I'm away, or long term."
        },
        postedAt: "5h ago",
        description: "Studio meublé haut de gamme aux Almadies. Sécurité 24/7, groupe électrogène, proche de la mer et des restaurants."
    },
    {
        id: 3,
        title: "Room in Colocation - Plateau",
        price: "125.000 FCFA",
        location: "Dakar Plateau",
        distance: "5 km",
        type: "Coloc",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
        author: {
            id: 103,
            name: "Awa Ndiaye",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
            backgroundImage: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=2669&ixlib=rb-4.0.3",
            age: 23,
            gender: "Female",
            bio: "Working in marketing. We are a group of 3 friends looking for a 4th person to complete our coloc!"
        },
        postedAt: "1j ago",
        description: "Une chambre se libère dans notre grande coloc au Plateau. Ambiance sympa, grande terrasse. \n\nLoyer 125.000 FCFA.\nDispo de suite."
    }
];

export const MOCK_CONVERSATIONS = [
    { id: 1, name: "Mary Johnson", initials: "MJ", lastMessage: "See you at the library! 📚", time: "2m", unread: 3, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" }, // Reusing Sarah's avatar for demo/consistency or just a placeholder if needed. Actually let's use a new one or keep it generic.
    { id: 2, name: "Study Group 101", initials: "SG", lastMessage: "Who's bringing notes tomorrow?", time: "15m", unread: 12, avatar: null },
    { id: 3, name: "Alex Chen", initials: "AC", lastMessage: "Thanks for the help!", time: "1h", unread: 0, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36" },
    { id: 4, name: "Campus Events", initials: "CE", lastMessage: "🎉 New event posted: Spring Fest", time: "2h", unread: 1, avatar: null },
    { id: 5, name: "Kevin O.", initials: "KO", lastMessage: "Lol that was hilarious 😂", time: "3h", unread: 0, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
    { id: 6, name: "Lisa Park", initials: "LP", lastMessage: "Can you send me the slides?", time: "5h", unread: 0, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2" },
    { id: 7, name: "Dorm 4B Chat", initials: "D4", lastMessage: "Pizza night tonight? 🍕", time: "1d", unread: 5, avatar: null },
];
