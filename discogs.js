const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios');

// Georgia Maq: 4092458

const typeDefs = gql`
  type Artist {
    id: Int
    name: String
    profile: String
    realname: String
    uri: String
    releases: [Release]
  }

  type Release {
    id: Int
    title: String
    year: String
    artist: String
  }

  type Query {
    artist(id: Int!): Artist!
  }
`;

const resolvers = {
  Query: {
    artist(root, args) {
      return axios
        .get('https://api.discogs.com/artists/' + args.id)
        .then(response => response.data);
    }
  },

  Artist: {
    releases(artist) {
      return axios
        .get('https://api.discogs.com/artists/' + artist.id + '/releases')
        .then(response => response.data.releases);
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🕺 Your server is up and running: ${url}`);
});
