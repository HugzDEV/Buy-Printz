import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Tag,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import SEOHead from './SEOHead'
import { getBlogPostBySlug } from '../data/blogPosts'

const BlogPost = () => {
  const { slug } = useParams()

  // Get the blog post by slug
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const shareUrl = `https://buyprintz.com/blog/${post.slug}`
  const shareTitle = post.title

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        url={`https://buyprintz.com/blog/${post.slug}`}
        image={post.thumbnail}
        type="article"
        author={post.author}
        publishedTime={post.date}
        modifiedTime={post.date}
        section={post.category}
        tags={post.tags}
      />
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {post.category}
            </span>
            {post.featured && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-600 font-medium">Share:</span>
            <div className="flex items-center gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {post.content}
            </div>
          </div>
        </article>

        {/* Tags */}
        <div className="mt-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">Tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Marketing?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Discover how our premium Business Card Tins, Trade Show Tents, and Vinyl Banners can elevate your brand and create lasting impressions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/business-card-tins"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Business Card Tins
            </Link>
            <Link
              to="/tradeshow-tents"
              className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              View Trade Show Tents
            </Link>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Posts
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BlogPost