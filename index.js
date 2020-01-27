const { ApolloServer, gql } = require('apollo-server');

const generateId = (() => {
  let id = 100;
  return () => id++;
})();

const artists = [
  {
    id: 1,
    name: 'The National'
  },
  {
    id: 2,
    name: 'Camp Cope'
  },
  {
    id: 3,
    name: 'Rilo Kiley'
  }
];

const albums = [
  {
    id: 1,
    artistId: 1,
    title: 'Trouble Will Find Me',
    year: 2013
  },
  {
    id: 2,
    artistId: 2,
    title: 'How to Socialize and Make Friends',
    year: 2018
  },
  {
    id: 3,
    artist: 3,
    title: 'The Execution of All Things',
    year: 2002
  },
  {
    id: 4,
    artistId: 1,
    title: 'I Am Easy to Find',
    year: 2019
  },
  {
    id: 5,
    artistId: 2,
    title: 'Camp Cope',
    year: 2016
  },
  {
    id: 6,
    artistId: 3,
    title: 'More Adventurous',
    year: 2004
  }
];

const typeDefs = gql`
  type Artist {
    id: Int
    name: String
    albums: [Album]
  }

  type Album {
    id: Int
    title: String
    year: Int
    artist: Artist
  }

  type Query {
    artists: [Artist!]
    albums: [Album!]
    artist(id: Int!): Artist!
    album(id: Int!): Album!
  }

  type Mutation {
    addArtist(name: String!): Artist
    addAlbum(title: String!, year: Int, artistId: Int): Album
  }
`;

const resolvers = {
  Query: {
    artists() {
      return new Promise(resolve => resolve(artists));
    },
    albums() {
      return albums;
    },
    artist(root, args) {
      return artists.find(artist => artist.id === args.id);
    },
    album(root, args) {
      return albums.find(album => album.id === args.id);
    }
  },

  Artist: {
    albums: artist => {
      return albums.filter(album => album.artistId === artist.id);
    }
  },

  Album: {
    artist: album => {
      return artists.find(artist => artist.id === album.artistId);
    }
  },

  Mutation: {
    addArtist(_, args) {
      const artist = {
        name: args.name,
        id: generateId()
      };

      artists.push(artist);

      return artist;
    },
    addAlbum(_, args) {
      const { title, year, artistId } = args;

      if (!artists.map(artist => artist.id).includes(artistId)) {
        throw new Error(`No such artist with the id of ${artistId}`);
      }

      const album = {
        title,
        year,
        artistId,
        id: generateId()
      };

      albums.push(album);

      return album;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

server.listen().then(({ url }) => {
  console.log(`🕺 Your server is up and running: ${url}`);
});
