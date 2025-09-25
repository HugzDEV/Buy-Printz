import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  Star, 
  Heart, 
  Share2, 
  ExternalLink, 
  Instagram, 
  Facebook, 
  Globe,
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  Tag,
  TrendingUp,
  Award,
  Users,
  DollarSign
} from 'lucide-react';
import authService from '../services/auth';
import { toast } from 'sonner';
import SEOHead from './SEOHead';

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
        setUser(null);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (creatorId) {
      loadCreatorProfile();
      loadCreatorTemplates();
      if (user) {
        checkFollowStatus();
      }
    }
  }, [creatorId, user]);

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.buyprintz.com/api/creator-marketplace/creators/${creatorId}`);
      
      if (!response.ok) {
        throw new Error('Creator not found');
      }
      
      const result = await response.json();
      if (result.success) {
        setCreator(result.creator);
        setFollowersCount(result.creator.followers_count || 0);
      } else {
        throw new Error(result.message || 'Failed to load creator profile');
      }
    } catch (err) {
      console.error('Error loading creator profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCreatorTemplates = async () => {
    try {
      const response = await fetch(`https://api.buyprintz.com/api/creator-marketplace/creators/${creatorId}/templates`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplates(result.templates);
        }
      }
    } catch (err) {
      console.error('Error loading creator templates:', err);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !creatorId) return;
    
    try {
      const response = await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/follow-status`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
      }
    } catch (error) {
      console.error("Failed to fetch follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.info("Please log in to follow creators.");
      return;
    }

    try {
      let response;
      if (isFollowing) {
        response = await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/follow`, {
          method: 'DELETE',
        });
      } else {
        response = await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/follow`, {
          method: 'POST',
        });
      }

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prevCount => isFollowing ? prevCount - 1 : prevCount + 1);
        toast.success(isFollowing ? "Unfollowed creator." : "Successfully followed creator!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to update follow status.");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/creator/${creatorId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator?.display_name} - Creator Profile`,
          text: `Check out ${creator?.display_name}'s amazing designs on BuyPrintz!`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl);
        toast.success("Profile link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Creator Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "This creator profile doesn't exist or has been deactivated."}</p>
          <Link 
            to="/marketplace" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const seoConfig = {
    title: `${creator.display_name} - Creator Profile | BuyPrintz`,
    description: `Discover amazing designs by ${creator.display_name}. ${creator.bio || 'Professional creator on BuyPrintz marketplace.'} View ${templates.length} templates and follow for updates.`,
    keywords: `${creator.display_name}, creator, designer, templates, marketplace, BuyPrintz, ${creator.bio || ''}`,
    ogTitle: `${creator.display_name} - Creator Profile`,
    ogDescription: `Check out ${creator.display_name}'s amazing designs on BuyPrintz!`,
    ogImage: creator.profile_image_url || '/assets/images/buyprintz_logo.png'
  };

  return (
    <>
      <SEOHead {...seoConfig} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                to="/marketplace" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Marketplace
              </Link>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShareProfile}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
                  title="Share Profile"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                {user && user.user_id !== creatorId && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isFollowing
                        ? 'bg-white/20 text-gray-700 hover:bg-white/30 border border-white/30'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Creator Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Image */}
              <div className="relative">
                {creator.profile_image_url ? (
                  <img 
                    src={creator.profile_image_url} 
                    alt={creator.display_name}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border-4 border-white/30 shadow-lg">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
                  </div>
                )}
                {creator.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {creator.display_name}
                      {creator.is_verified && (
                        <span className="ml-2 text-blue-500" title="Verified Creator">
                          <Award className="w-6 h-6 inline" />
                        </span>
                      )}
                    </h1>
                    
                    {creator.bio && (
                      <p className="text-gray-600 mb-4 max-w-2xl">{creator.bio}</p>
                    )}

                    {/* Social Links */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {creator.social_links?.instagram && (
                        <a 
                          href={creator.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
                        >
                          <Instagram className="w-4 h-4 mr-1" />
                          <span className="text-sm">Instagram</span>
                        </a>
                      )}
                      
                      {creator.social_links?.facebook && (
                        <a 
                          href={creator.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Facebook className="w-4 h-4 mr-1" />
                          <span className="text-sm">Facebook</span>
                        </a>
                      )}
                      
                      {creator.website && (
                        <a 
                          href={creator.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          <span className="text-sm">Website</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600">{templates.length}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Templates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600">{creator.templates_sold}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">{followersCount}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                        {creator.rating > 0 ? creator.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {creator.display_name}'s Templates
              </h2>
              <div className="text-sm text-gray-600">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </div>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Template Preview */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                      {template.preview_image_url ? (
                        <img 
                          src={template.preview_image_url} 
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Tag className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-500">Preview</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {template.is_featured && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-2 py-1 rounded-lg text-sm">
                        ${template.price}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      
                      {/* Template Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {template.view_count || 0}
                        </div>
                        <div className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {template.sales_count || 0}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {template.rating > 0 ? template.rating.toFixed(1) : '0.0'}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {template.category}
                        </span>
                        <Link 
                          to={`/marketplace/template/${template.id}`}
                          className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
                <p className="text-gray-600">
                  {creator.display_name} hasn't uploaded any templates yet. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatorProfile;
