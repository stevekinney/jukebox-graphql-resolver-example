const id = require('lodash/uniqueId');
const { ApolloServer, gql } = require('apollo-server');

const generateId = () => parseInt(id(1));

const artists = require('./data/artists');
const albums = require('./data/albums');
const songs = require('./data/songs');

const typeDefs = gql`
  type Artist {
    id: Int
    name: String
    albums: [Album]
    songs: [Song]
  }

  type Album {
    id: Int
    title: String
    year: Int
    artist: Artist
    songs: [Song]
  }

  type Song {
    id: Int
    title: String
    time: Int
    artist: Artist
    album: Album
    artistName: String
    albumTitle: String
  }

  type Query {
    artists: [Artist!]
    albums: [Album!]
    songs: [Song!]
    artist(id: Int!): Artist!
    album(id: Int!): Album!
    song(id: Int!): Song!
  }

  type Mutation {
    addArtist(name: String!): Artist
    addAlbum(title: String!, year: Int, artistId: Int): Album
    addSong(title: String!, time: Int, artistId: Int, albumId: Int): Song
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
    songs() {
      return songs;
    },
    artist(root, args) {
      return artists.find(artist => artist.id === args.id);
    },
    album(root, args) {
      return albums.find(album => album.id === args.id);
    },
    song(root, args) {
      return songs.find(song => song.id === args.id);
    }
  },

  Artist: {
    albums(artist) {
      return albums.filter(album => album.artistId === artist.id);
    },
    songs(artist) {
      return songs.filter(song => song.artistId === artist.id);
    }
  },

  Album: {
    artist(album) {
      return artists.find(artist => artist.id === album.artistId);
    },
    songs(album) {
      return songs.filter(song => song.albumId === album.id);
    }
  },

  Song: {
    artist(song) {
      return artists.find(artist => artist.id === song.artistId);
    },
    album(song) {
      return albums.find(album => album.id === song.albumId);
    },
    artistName(song) {
      return artists.find(artist => artist.id === song.artistId).name;
    },
    albumTitle(song) {
      return albums.find(album => album.id === song.albumId).title;
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
      const { artistId } = args;

      if (!artists.map(artist => artist.id).includes(artistId)) {
        throw new Error(`No such artist with the id of ${artistId}`);
      }

      const album = {
        ...args,
        id: generateId()
      };

      albums.push(album);

      return album;
    },

    addSong(_, args) {
      if (!artists.map(artist => artist.id).includes(args.artistId)) {
        throw new Error(`No such artist with the id of ${args.artistId}`);
      }

      if (!albums.map(album => album.id).includes(args.albumId)) {
        throw new Error(`No such album with the id of ${args.albumId}`);
      }

      const song = {
        ...args,
        id: generateId()
      };

      songs.push(song);

      return song;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🕺 Your server is up and running: ${url}`);
});
