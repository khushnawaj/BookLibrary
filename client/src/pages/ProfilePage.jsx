import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { updateUserProfile } from '@/features/auth/authApi';
import { uploadService, userService } from '@/services';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MotionCard } from '@/components/animations/PageTransition';
import { PostCard } from '@/components/social/PostCard';
import {
  Camera, Edit2, Check, X, Loader2, Mail, Shield, AtSign,
  BookOpen, Users, UserCheck, Calendar, BookMarked
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { username: urlUsername } = useParams();
  const { user: currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);

  const targetUsername = urlUsername || currentUser?.username;
  const isOwnProfile = !urlUsername || urlUsername === currentUser?.username;

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'library' | 'about'
  const [posts, setPosts] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch profile details
  useEffect(() => {
    if (!targetUsername) return;

    const fetchProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        const res = await userService.getProfile(targetUsername);
        const fetchedProfile = res.data.data.profile;
        setProfile(fetchedProfile);

        // Sync edit inputs
        setName(fetchedProfile.name || '');
        setUsernameInput(fetchedProfile.username || '');
        setBio(fetchedProfile.bio || '');
        setAvatar(fetchedProfile.avatar || '');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [targetUsername]);

  // Fetch posts when tab is active
  useEffect(() => {
    if (!targetUsername || activeTab !== 'posts') return;

    const fetchPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const res = await userService.getUserPosts(targetUsername);
        setPosts(res.data.data.posts);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load posts');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [targetUsername, activeTab]);

  // Fetch library when tab is active
  useEffect(() => {
    if (!targetUsername || activeTab !== 'library') return;

    const fetchLibrary = async () => {
      try {
        setIsLoadingLibrary(true);
        const res = await userService.getUserLibrary(targetUsername);
        setLibraryEntries(res.data.data.entries);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load library');
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    fetchLibrary();
  }, [targetUsername, activeTab]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#8B4513] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1C1A17]">User not found</h2>
        <p className="text-[#8A7F74] mt-2">The profile you are looking for does not exist or is private.</p>
        <Button asChild className="mt-4 bg-[#8B4513] hover:bg-[#C0622F] text-white">
          <Link to="/feed">Back to Feed</Link>
        </Button>
      </div>
    );
  }

  const handleAvatarClick = () => {
    if (isEditing && isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      try {
        setIsUploading(true);
        const res = await uploadService.uploadAvatar(selectedFile);
        const imageUrl = res.data.data.secureUrl;
        setAvatar(imageUrl);
        toast.success('Avatar uploaded successfully!');
      } catch (error) {
        console.error(error);
        toast.error('Failed to upload avatar');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (usernameInput.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    try {
      setIsSaving(true);
      const res = await dispatch(
        updateUserProfile({
          name: name.trim(),
          username: usernameInput.trim().toLowerCase(),
          bio: bio.trim(),
          avatar,
        })
      ).unwrap();

      setProfile((prev) => ({
        ...prev,
        name: res.user.name,
        username: res.user.username,
        bio: res.user.bio,
        avatar: res.user.avatar,
      }));

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name);
    setUsernameInput(profile.username);
    setBio(profile.bio);
    setAvatar(profile.avatar);
    setIsEditing(false);
  };

  const handleFollowToggle = async () => {
    try {
      if (profile.isFollowing) {
        await userService.unfollowUser(profile._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1),
        }));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await userService.followUser(profile._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: prev.followersCount + 1,
        }));
        toast.success(`Following @${profile.username}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update follow status');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 bg-[#8B4513]/10 text-[#8B4513] border-none font-medium">
            {isOwnProfile ? 'Your Space' : 'Community Profile'}
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1A17]">
            {isOwnProfile ? 'Your Profile' : `${profile.name}'s Profile`}
          </h1>
        </div>
        
        {isOwnProfile ? (
          !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-[#8B4513] hover:bg-[#C0622F] text-white flex items-center gap-1.5 shadow-sm"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Button>
          )
        ) : (
          <Button
            onClick={handleFollowToggle}
            className={cn(
              "flex items-center gap-1.5 transition-all shadow-sm border",
              profile.isFollowing
                ? "bg-[#F5F0E8] text-[#8B4513] border-[#DDD4C4] hover:bg-[#EDE6D8]"
                : "bg-[#8B4513] hover:bg-[#C0622F] text-white border-transparent"
            )}
          >
            {profile.isFollowing ? (
              <><UserCheck className="w-4 h-4" /> Following</>
            ) : (
              <><Users className="w-4 h-4" /> Follow</>
            )}
          </Button>
        )}
      </div>

      <MotionCard>
        <Card className="border-[#DDD4C4] bg-white shadow-sm overflow-hidden rounded-2xl">
          {/* Header Banner */}
          <div className="h-36 w-full bg-gradient-to-r from-[#8B4513] via-[#C0622F] to-[#D4931A]" />
          
          <CardHeader className="relative pb-4 pt-0">
            {/* Avatar overlapping the banner */}
            <div className="absolute -top-16 left-6">
              <div 
                onClick={handleAvatarClick}
                className={cn(
                  "relative group rounded-full border-4 border-white shadow-md overflow-hidden",
                  isEditing && isOwnProfile ? 'cursor-pointer' : ''
                )}
              >
                <Avatar src={isEditing ? avatar : profile.avatar} name={profile.name} size="xl" className="h-24 w-24 text-2xl" />
                {isEditing && isOwnProfile && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            
            {/* Display names & follow stats */}
            <div className="pt-12 pl-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-[#1C1A17]">{profile.name}</CardTitle>
                <p className="text-sm text-[#8A7F74] mt-0.5">@{profile.username}</p>
                {profile.bio && !isEditing && (
                  <p className="text-sm text-[#3D3530] mt-3 max-w-xl italic leading-relaxed">
                    "{profile.bio}"
                  </p>
                )}
              </div>

              {/* Counts dashboard */}
              <div className="flex items-center gap-6 bg-[#F5F0E8] border border-[#DDD4C4] rounded-xl px-4 py-2.5 shrink-0">
                <div className="text-center">
                  <span className="block text-lg font-bold text-[#8B4513]">{profile.booksRead || 0}</span>
                  <span className="text-[10px] font-bold text-[#8A7F74] uppercase tracking-wider">Books Read</span>
                </div>
                <div className="w-px h-8 bg-[#DDD4C4]" />
                <div className="text-center">
                  <span className="block text-lg font-bold text-[#8B4513]">{profile.followersCount || 0}</span>
                  <span className="text-[10px] font-bold text-[#8A7F74] uppercase tracking-wider">Followers</span>
                </div>
                <div className="w-px h-8 bg-[#DDD4C4]" />
                <div className="text-center">
                  <span className="block text-lg font-bold text-[#8B4513]">{profile.followingCount || 0}</span>
                  <span className="text-[10px] font-bold text-[#8A7F74] uppercase tracking-wider">Following</span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            {!isEditing && (
              <div className="flex border-b border-[#DDD4C4]/50 gap-6 mt-8">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5",
                    activeTab === 'posts' ? "border-[#8B4513] text-[#8B4513]" : "border-transparent text-[#8A7F74] hover:text-[#1C1A17]"
                  )}
                >
                  <BookMarked className="w-4 h-4" /> Activity Feed
                </button>
                <button
                  onClick={() => setActiveTab('library')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5",
                    activeTab === 'library' ? "border-[#8B4513] text-[#8B4513]" : "border-transparent text-[#8A7F74] hover:text-[#1C1A17]"
                  )}
                >
                  <BookOpen className="w-4 h-4" /> Library Collection
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5",
                    activeTab === 'about' ? "border-[#8B4513] text-[#8B4513]" : "border-transparent text-[#8A7F74] hover:text-[#1C1A17]"
                  )}
                >
                  <Users className="w-4 h-4" /> About Details
                </button>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-2">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-sm font-semibold text-[#3D3530]">Display Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="border-[#DDD4C4] focus:ring-[#8B4513] bg-[#F5F0E8]/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-username" className="text-sm font-semibold text-[#3D3530]">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7F74]">
                        <AtSign className="w-4 h-4" />
                      </span>
                      <Input
                        id="profile-username"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="username"
                        className="pl-9 border-[#DDD4C4] focus:ring-[#8B4513] bg-[#F5F0E8]/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-bio" className="text-sm font-semibold text-[#3D3530]">Biography</Label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other readers about yourself..."
                    className="w-full min-h-[100px] rounded-lg border border-[#DDD4C4] bg-[#F5F0E8]/20 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    maxLength={500}
                  />
                  <p className="text-[11px] text-[#8A7F74] text-right">
                    {bio.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#DDD4C4]/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving || isUploading}
                    className="border-[#DDD4C4] text-[#3D3530] hover:bg-[#F5F0E8] flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="bg-[#8B4513] hover:bg-[#C0622F] text-white flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Check className="w-4 h-4" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4">
                {/* ── Tab: Posts ── */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {isLoadingPosts ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#8B4513] animate-spin" />
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-16 bg-[#F5F0E8]/20 rounded-2xl border border-dashed border-[#DDD4C4] p-6 text-[#8A7F74]">
                        <BookMarked className="w-8 h-8 mx-auto mb-2 text-[#DDD4C4]" />
                        <p className="font-semibold text-sm">No activity yet</p>
                        <p className="text-xs text-[#8A7F74] mt-0.5">This user hasn't posted anything to the feed.</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))
                    )}
                  </div>
                )}

                {/* ── Tab: Library ── */}
                {activeTab === 'library' && (
                  <div>
                    {isLoadingLibrary ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#8B4513] animate-spin" />
                      </div>
                    ) : libraryEntries.length === 0 ? (
                      <div className="text-center py-16 bg-[#F5F0E8]/20 rounded-2xl border border-dashed border-[#DDD4C4] p-6 text-[#8A7F74]">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#DDD4C4]" />
                        <p className="font-semibold text-sm">Library is empty</p>
                        <p className="text-xs text-[#8A7F74] mt-0.5">No books have been logged by this user yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {libraryEntries.map((entry) => (
                          <div 
                            key={entry._id} 
                            className="bg-white rounded-xl border border-[#DDD4C4] p-3 flex gap-3 hover:shadow-md transition-shadow"
                          >
                            {entry.book?.coverImage ? (
                              <img 
                                src={entry.book.coverImage} 
                                className="w-16 h-24 object-cover rounded-lg border border-[#DDD4C4] shrink-0" 
                                alt="Book cover" 
                              />
                            ) : (
                              <div className="w-16 h-24 bg-[#F5F0E8] rounded-lg border border-[#DDD4C4] flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6 text-[#8A7F74]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="font-semibold text-sm text-[#1C1A17] line-clamp-2 leading-tight">
                                  {entry.book?.title}
                                </h4>
                                <p className="text-xs text-[#8A7F74] mt-1 truncate">{entry.book?.author}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge className={cn("text-[10px] px-2 py-0.5 font-medium border-none", 
                                  entry.shelfType === 'READ' && 'bg-green-100 text-green-800',
                                  entry.shelfType === 'READING' && 'bg-blue-100 text-blue-800',
                                  entry.shelfType === 'WISHLIST' && 'bg-yellow-100 text-yellow-800',
                                  entry.shelfType === 'DROPPED' && 'bg-red-100 text-red-800'
                                )}>
                                  {entry.shelfType}
                                </Badge>
                                {entry.rating > 0 && (
                                  <span className="text-xs text-amber-500 font-semibold">★ {entry.rating}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab: About ── */}
                {activeTab === 'about' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8]/50 border border-[#DDD4C4]/50">
                        <Mail className="w-5 h-5 text-[#8B4513] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7F74]">Email Address</p>
                          <p className="mt-0.5 text-sm font-medium text-[#3D3530] truncate">
                            {isOwnProfile ? currentUser?.email : 'Hidden for privacy'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8]/50 border border-[#DDD4C4]/50">
                        <Shield className="w-5 h-5 text-[#8B4513] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7F74]">Account Role</p>
                          <p className="mt-0.5 text-sm font-medium text-[#3D3530] capitalize">{profile.role || 'Member'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F0E8]/50 border border-[#DDD4C4]/50">
                      <Calendar className="w-5 h-5 text-[#8B4513] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7F74]">Member Since</p>
                        <p className="mt-0.5 text-sm font-medium text-[#3D3530]">
                          {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'Recently joined'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#DDD4C4]/60">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8A7F74]">Biography</p>
                      <p className="mt-2 text-sm text-[#3D3530] leading-relaxed whitespace-pre-line bg-[#F5F0E8]/40 p-4 rounded-xl border border-[#DDD4C4]/40">
                        {profile.bio || 'No bio yet.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </MotionCard>
    </div>
  );
}
