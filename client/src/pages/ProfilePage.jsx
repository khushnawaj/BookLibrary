import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { updateUserProfile } from '@/features/auth/authApi';
import { uploadService, userService, postService } from '@/services';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MotionCard } from '@/components/animations/PageTransition';
import { PostCard } from '@/components/social/PostCard';
import { Modal } from '@/components/ui/modal';
import {
  Camera, Edit2, Check, X, Loader2, Mail, Shield, AtSign,
  BookOpen, Users, UserCheck, Calendar, BookMarked, Bookmark
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
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'library' | 'about'
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Follow modal states
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

  // Fetch followers
  const handleOpenFollowers = async () => {
    setIsFollowersOpen(true);
    try {
      setIsLoadingFollowers(true);
      const res = await userService.getFollowers(profile._id);
      setFollowersList(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load followers');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  // Fetch following
  const handleOpenFollowing = async () => {
    setIsFollowingOpen(true);
    try {
      setIsLoadingFollowing(true);
      const res = await userService.getFollowing(profile._id);
      setFollowingList(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load following list');
    } finally {
      setIsLoadingFollowing(false);
    }
  };

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

  // Fetch saved posts when tab is active
  useEffect(() => {
    if (!isOwnProfile || activeTab !== 'saved') return;

    const fetchSavedPosts = async () => {
      try {
        setIsLoadingSavedPosts(true);
        const res = await postService.getSavedPosts();
        setSavedPosts(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load saved posts');
      } finally {
        setIsLoadingSavedPosts(false);
      }
    };

    fetchSavedPosts();
  }, [activeTab, isOwnProfile]);

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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground">User not found</h2>
        <p className="text-muted-foreground mt-2">The profile you are looking for does not exist or is private.</p>
        <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
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
          <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-none font-medium">
            {isOwnProfile ? 'Your Space' : 'Community Profile'}
          </Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {isOwnProfile ? 'Your Profile' : `${profile.name}'s Profile`}
          </h1>
        </div>

        {isOwnProfile ? (
          !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 shadow-sm rounded-xl"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Button>
          )
        ) : (
          <Button
            onClick={handleFollowToggle}
            className={cn(
              "flex items-center gap-1.5 transition-all shadow-sm border rounded-xl",
              profile.isFollowing
                ? "bg-secondary text-primary border-glass-border hover:bg-secondary/80"
                : "bg-primary hover:bg-primary/95 text-primary-foreground border-transparent"
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
        <Card className="border-glass-border bg-card/70 glass-card shadow-sm overflow-hidden rounded-2xl">
          {/* Header Banner */}
          <div className="h-36 w-full bg-gradient-to-r from-primary via-primary/80 to-secondary/35" />

          <CardHeader className="relative pb-4 pt-0">
            {/* Avatar overlapping the banner */}
            <div className="absolute -top-16 left-6">
              <div
                onClick={handleAvatarClick}
                className={cn(
                  "relative group rounded-full border-4 border-background shadow-md overflow-hidden",
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
                <CardTitle className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{profile.name}</CardTitle>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>@{profile.username}</p>
                {profile.bio && !isEditing && (
                  <p className="text-sm mt-3 max-w-xl italic leading-relaxed" style={{ color: 'var(--color-foreground)', opacity: 0.8 }}>
                    "{profile.bio}"
                  </p>
                )}
              </div>

              {/* Counts dashboard */}
              <div className="flex items-center gap-6 bg-secondary/40 border border-glass-border rounded-xl px-4 py-2.5 shrink-0">
                <div className="text-center">
                  <span className="block text-lg font-bold text-primary">{profile.booksRead || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Books Read</span>
                </div>
                <div className="w-px h-8 bg-glass-border" />
                <div onClick={handleOpenFollowers} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="block text-lg font-bold text-primary">{profile.followersCount || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Followers</span>
                </div>
                <div className="w-px h-8 bg-glass-border" />
                <div onClick={handleOpenFollowing} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="block text-lg font-bold text-primary">{profile.followingCount || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Following</span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            {!isEditing && (
              <div className="flex border-b border-glass-border gap-6 mt-8 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap",
                    activeTab === 'posts' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookMarked className="w-4 h-4" /> Activity Feed
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                      "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap",
                      activeTab === 'saved' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Bookmark className="w-4 h-4" /> Bookmarks
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('library')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap",
                    activeTab === 'library' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <BookOpen className="w-4 h-4" /> Library Collection
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={cn(
                    "pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap",
                    activeTab === 'about' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
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
                    <Label htmlFor="profile-name" className="text-sm font-semibold text-foreground/80">Display Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="border-glass-border focus:ring-primary bg-secondary/15 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-username" className="text-sm font-semibold text-foreground/80">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <AtSign className="w-4 h-4" />
                      </span>
                      <Input
                        id="profile-username"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="username"
                        className="pl-9 border-glass-border focus:ring-primary bg-secondary/15 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-bio" className="text-sm font-semibold" style={{ color: 'var(--color-foreground)', opacity: 0.8 }}>Biography</Label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other readers about yourself..."
                    style={{ color: 'var(--color-foreground)' }}
                    className="w-full min-h-[100px] rounded-xl border border-glass-border bg-secondary/15 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    maxLength={500}
                  />
                  <p className="text-[11px] text-right" style={{ color: 'var(--color-muted-foreground)' }}>
                    {bio.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-glass-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving || isUploading}
                    className="border-glass-border text-foreground hover:bg-secondary/40 flex items-center gap-1.5 rounded-xl"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1.5 rounded-xl"
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
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-6 text-muted-foreground">
                        <BookMarked className="w-8 h-8 mx-auto mb-2 text-muted-foreground/45" />
                        <p className="font-semibold text-sm">No activity yet</p>
                        <p className="text-xs text-muted-foreground mt-0.5">This user hasn't posted anything to the feed.</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))
                    )}
                  </div>
                )}

                {/* ── Tab: Saved Posts (Bookmarks) ── */}
                {activeTab === 'saved' && isOwnProfile && (
                  <div className="space-y-4">
                    {isLoadingSavedPosts ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : savedPosts.length === 0 ? (
                      <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-6 text-muted-foreground">
                        <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground/45" />
                        <p className="font-semibold text-sm">No saved posts</p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">Posts you bookmark will appear here.</p>
                      </div>
                    ) : (
                      savedPosts.map((post) => (
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
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                    ) : libraryEntries.length === 0 ? (
                      <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-6 text-muted-foreground">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/45" />
                        <p className="font-semibold text-sm">Library is empty</p>
                        <p className="text-xs text-muted-foreground mt-0.5">No books have been logged by this user yet.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {libraryEntries.map((entry) => (
                          <div
                            key={entry._id}
                            className="bg-card/60 glass-card rounded-xl border border-glass-border p-3 flex gap-3 hover:shadow-md transition-shadow"
                          >
                            {entry.book?.coverImage ? (
                              <img
                                src={entry.book.coverImage}
                                className="w-16 h-24 object-cover rounded-lg border border-glass-border shrink-0"
                                alt="Book cover"
                              />
                            ) : (
                              <div className="w-16 h-24 bg-secondary/20 rounded-lg border border-glass-border flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                                  {entry.book?.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{entry.book?.author}</p>
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
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/25 border border-glass-border">
                        <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground truncate">
                            {isOwnProfile ? currentUser?.email : 'Hidden for privacy'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/25 border border-glass-border">
                        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Role</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground capitalize">{profile.role || 'Member'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/25 border border-glass-border">
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Member Since</p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {profile.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'Recently joined'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-glass-border">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biography</p>
                      <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-line bg-secondary/15 p-4 rounded-xl border border-glass-border">
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

      <Modal
        open={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
        title="Followers"
        description={`People who follow ${profile.name}`}
        className="max-w-md"
      >
        {isLoadingFollowers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : followersList.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No followers yet.</p>
        ) : (
          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
            {followersList.map((item) => {
              const followerUser = item.follower;
              if (!followerUser) return null;
              return (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-glass-border last:border-b-0">
                  <Link
                    to={`/profile/${followerUser.username}`}
                    onClick={() => setIsFollowersOpen(false)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar src={followerUser.avatar} name={followerUser.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{followerUser.name}</p>
                      <p className="text-xs text-muted-foreground">@{followerUser.username}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={isFollowingOpen}
        onClose={() => setIsFollowingOpen(false)}
        title="Following"
        description={`People followed by ${profile.name}`}
        className="max-w-md"
      >
        {isLoadingFollowing ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : followingList.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">Not following anyone yet.</p>
        ) : (
          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
            {followingList.map((item) => {
              const followingUser = item.following;
              if (!followingUser) return null;
              return (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-glass-border last:border-b-0">
                  <Link
                    to={`/profile/${followingUser.username}`}
                    onClick={() => setIsFollowingOpen(false)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar src={followingUser.avatar} name={followingUser.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{followingUser.name}</p>
                      <p className="text-xs text-muted-foreground">@{followingUser.username}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
