const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount: async () => Book.collection.countDocuments(),
      authorCount: async () => Author.collection.countDocuments(),
  
      allBooks: async(root, args) => {
        if (args.author && args.genre) {
          const author = await Author.findOne({ name: args.author })
          if (author) {
            return Book.find({ author: author._id, genres: args.genre }).populate('author')
          } else {
            return []
          }
        } else if (args.author) {
          const author = await Author.findOne({ name: args.author })
          if (author) {
            return Book.find({ author: author._id }).populate('author')
          } else {
            return []
          }
        } else if (args.genre) {
          return Book.find({ genres: args.genre }).populate('author')
        } else {
          return Book.find({}).populate('author')
        }
      },
  
      allAuthors: async() => Author.find({}),
      
      allGenres: async() => {
        const books = await Book.find({})
        let genres = []
        books.map(book => genres = genres.concat(book.genres))
        
        return Array.from(new Set(genres))
      },
  
      me: (root, args, context) => {
        return context.currentUser
      }
  
    },
  
    Mutation: {
      addBook: async(root, args, context) => {
        const currentUser = context.currentUser
  
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
  
        const found_author = await Author.findOne({ name: args.author })
        
        let save_author = null
  
        if (!found_author) {
          save_author = new Author({ name: args.author, born: null})
          try {
            save_author.save()
          } catch (error) {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
                error
              }
            })
          }
        } else {
          save_author = found_author
        }
  
        const book = new Book({ ...args, author: save_author._id })
        
        try {
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
              error
            }
          })
        }

        populated_book = book.populate("author")

        pubsub.publish('BOOK_ADDED', { bookAdded: populated_book })
  
        return populated_book
      }, 
  
      editAuthor: async(root, args, context) => {
        
        const currentUser = context.currentUser
    
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
  
        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        return author.save()
      },
  
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
    
        return user.save()
          .catch(error => {
            throw new GraphQLError('Creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          })
      },
  
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'secret' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })        
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
      },
    },

    Subscription: {
        bookAdded: {
          subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
      },
  
    Author: {
      bookCount: async (root) => {
        return (await Book.find({ author: root._id})).length
      },
    }
  
  }

module.exports = resolvers