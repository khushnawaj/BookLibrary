import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/authHooks';
import { useAppDispatch } from '@/hooks/useAppStore';
import { updateUserProfile } from '@/features/auth/authApi';
import { uploadService, userService, postService, workService } from '@/services';
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
  BookOpen, Users, UserCheck, Calendar, BookMarked, Bookmark,
  Award, Trophy, Feather, Star, Globe, Lock, ChevronLeft, ChevronRight, Languages, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const AVATAR_STYLES = [
  { id: 'lorelei', name: 'Lorelei' },
  { id: 'adventurer', name: 'Adventurer' },
  { id: 'bottts', name: 'Bottts' },
  { id: 'pixel-art', name: 'Pixel' },
  { id: 'avataaars', name: 'Avataaars' },
  { id: 'croodles', name: 'Croodles' }
];

export default function ProfilePage() {
  const { username: urlUsername } = useParams();
  const { user: currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);

  const targetUsername = urlUsername || currentUser?.username;
  const isOwnProfile = !urlUsername || urlUsername === currentUser?.username;

  // Profile data state
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'library'
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [userWorks, setUserWorks] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingSavedPosts, setIsLoadingSavedPosts] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);

  // Posts Filtering & Pagination state
  const [postsPage, setPostsPage] = useState(1);
  const [totalPostsPages, setTotalPostsPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [postVisibilityFilter, setPostVisibilityFilter] = useState('ALL');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bio, setBio] = useState('');
  const [penName, setPenName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('lorelei');
  const [avatarSeed, setAvatarSeed] = useState('');

  const handleGenerateAvatar = () => {
    const seedValue = avatarSeed.trim() || Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(seedValue)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5cc,ffdfbf`;
    setAvatar(url);
    toast.success('Generated avatar preview!');
  };

  const handleShuffleAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(randomSeed);
    const url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5cc,ffdfbf`;
    setAvatar(url);
    toast.success('Generated random avatar preview!');
  };

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
        setPenName(fetchedProfile.penName || '');
        setAvatar(fetchedProfile.avatar || '');
        setBannerImage(fetchedProfile.bannerImage || '');
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
        const res = await userService.getUserPosts(targetUsername, {
          page: postsPage,
          limit: 6,
          visibility: postVisibilityFilter,
        });
        setPosts(res.data.data.posts || []);
        setTotalPostsPages(res.data.data.totalPages || 1);
        setTotalPostsCount(res.data.data.totalPosts || 0);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load posts');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [targetUsername, activeTab, postsPage, postVisibilityFilter]);

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

  // Fetch published works when tab is active
  useEffect(() => {
    if (!targetUsername || activeTab !== 'works') return;

    const fetchUserWorks = async () => {
      try {
        setIsLoadingWorks(true);
        const res = await workService.getUserWorks(targetUsername);
        setUserWorks(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load published works');
      } finally {
        setIsLoadingWorks(false);
      }
    };

    fetchUserWorks();
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
        <Button asChild className="mt-4 bg-primary hover:bg-primary/95 text-primary-foreground">
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
      e.target.value = '';
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      try {
        setIsUploading(true);
        const res = await uploadService.uploadAvatar(selectedFile);
        const imageUrl = res.data?.data?.secureUrl || res.data?.data?.url || res.data?.secureUrl || res.data?.url;
        if (imageUrl) {
          setAvatar(imageUrl);
          toast.success('Avatar uploaded successfully!');
        } else {
          toast.error('Could not parse avatar image URL');
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to upload avatar');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Upload banner from the hover overlay — uploads then immediately saves to server
  const handleBannerFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    // Reset input so the same file can be re-selected later
    e.target.value = '';
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    try {
      setIsUploadingBanner(true);
      // Step 1: Upload the image file
      const uploadRes = await uploadService.uploadAvatar(selectedFile);
      const imageUrl = uploadRes.data?.data?.secureUrl || uploadRes.data?.data?.url || uploadRes.data?.secureUrl || uploadRes.data?.url;
      if (!imageUrl) {
        toast.error('Could not parse cover banner image URL');
        return;
      }
      // Step 2: Immediately persist to server
      const saveRes = await dispatch(
        updateUserProfile({
          name: profile.name,
          username: profile.username,
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          bannerImage: imageUrl,
        })
      ).unwrap();
      const userData = saveRes.user || saveRes;
      // Step 3: Update both local profile state and form state
      setProfile((prev) => ({ ...prev, bannerImage: userData.bannerImage }));
      setBannerImage(userData.bannerImage);
      toast.success('Cover photo updated!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update cover photo');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Remove banner from the hover overlay — immediately clears on server
  const handleRemoveBanner = async () => {
    try {
      setIsUploadingBanner(true);
      const saveRes = await dispatch(
        updateUserProfile({
          name: profile.name,
          username: profile.username,
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          bannerImage: '',
        })
      ).unwrap();
      const userData = saveRes.user || saveRes;
      setProfile((prev) => ({ ...prev, bannerImage: userData.bannerImage }));
      setBannerImage('');
      toast.success('Cover photo removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove cover photo');
    } finally {
      setIsUploadingBanner(false);
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
          penName: penName.trim(),
          avatar,
          bannerImage,
        })
      ).unwrap();

      const userData = res.user || res;
      setProfile((prev) => ({
        ...prev,
        name: userData.name,
        username: userData.username,
        bio: userData.bio,
        penName: userData.penName,
        avatar: userData.avatar,
        bannerImage: userData.bannerImage,
      }));

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      let errMsg = 'Failed to update profile';
      if (typeof error === 'string') {
        errMsg = error;
      } else if (error && typeof error === 'object') {
        errMsg = error.message || errMsg;
        if (error.errors && Array.isArray(error.errors)) {
          const detailMsg = error.errors.map((e) => e.message).join(', ');
          if (detailMsg) errMsg = `${error.message}: ${detailMsg}`;
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name);
    setUsernameInput(profile.username);
    setBio(profile.bio);
    setPenName(profile.penName || '');
    setAvatar(profile.avatar);
    setBannerImage(profile.bannerImage || '');
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

  const handlePostDelete = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    setSavedPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    setSavedPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  // Dynamic Achievements calculation based on profile stats
  const calculatedAchievements = [
    {
      id: 'quickdraw',
      name: 'Quickdraw',
      desc: 'Set a custom profile avatar',
      icon: Camera,
      unlocked: !!profile.avatar && !profile.avatar.includes('default-avatar'),
    },
    {
      id: 'first_milestone',
      name: 'First Milestone',
      desc: 'Completed reading your first book',
      icon: Trophy,
      unlocked: profile.booksRead >= 1,
    },
    {
      id: 'avid_reader',
      name: 'Avid Reader',
      desc: 'Read 5 or more books',
      icon: BookOpen,
      unlocked: profile.booksRead >= 5,
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      desc: 'Earned your first follower',
      icon: Award,
      unlocked: profile.followersCount >= 1,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Top Cover Banner ── */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-36 sm:h-48 md:h-56 lg:h-64 w-full shadow-md border border-glass-border group/banner">
        {profile.bannerImage ? (
          <img
            src={profile.bannerImage}
            alt="Profile Cover Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/80 via-accent/60 to-primary/40 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Cover Edit Overlay — uploads immediately and auto-saves */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-10">
            <Button
              type="button"
              onClick={() => bannerFileInputRef.current?.click()}
              disabled={isUploadingBanner}
              variant="secondary"
              className="bg-white/95 text-foreground hover:bg-white border-none shadow-sm flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2 cursor-pointer transition-all hover:scale-105"
            >
              {isUploadingBanner ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Camera className="w-4 h-4 text-primary" />
              )}
              {isUploadingBanner ? 'Uploading...' : 'Change Cover'}
            </Button>
            {profile.bannerImage && (
              <Button
                type="button"
                onClick={handleRemoveBanner}
                disabled={isUploadingBanner}
                variant="destructive"
                className="bg-red-500/90 text-white hover:bg-red-600 border-none shadow-sm flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-2 cursor-pointer transition-all hover:scale-105"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </Button>
            )}
            <input
              type="file"
              ref={bannerFileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleBannerFileChange}
            />
          </div>
        )}
      </div>

      {/* ── Profile Unified Header Card ── */}
      <div className="relative px-2 sm:px-4 md:px-6 -mt-14 sm:-mt-16 md:-mt-20 z-20">
        <Card className="border-glass-border bg-card/90 glass-card shadow-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 backdrop-blur-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* 1. Left Column: Avatar & User Identity */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5">
              {/* Avatar Container with Ring */}
              <div className="relative group/avatar shrink-0">
                <div className="rounded-full p-1.5 bg-gradient-to-tr from-primary via-accent to-amber-500 shadow-xl transition-transform duration-500 group-hover/avatar:rotate-6">
                  <div className="rounded-full border-4 border-card overflow-hidden bg-background">
                    <Avatar src={profile.avatar} name={profile.name} size="xl" className="h-22 w-22 sm:h-26 sm:w-26 md:h-28 md:w-28 text-2xl font-display" />
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setName(profile.name);
                      setUsernameInput(profile.username);
                      setBio(profile.bio || '');
                      setPenName(profile.penName || '');
                      setAvatar(profile.avatar || '');
                      setBannerImage(profile.bannerImage || '');
                      if (profile.avatar && profile.avatar.includes('api.dicebear.com')) {
                        try {
                          const url = new URL(profile.avatar);
                          const pathParts = url.pathname.split('/');
                          const style = pathParts[2];
                          const seedParam = url.searchParams.get('seed');
                          if (style) setAvatarStyle(style);
                          if (seedParam) setAvatarSeed(seedParam);
                        } catch (e) {
                          setAvatarSeed(profile.username);
                        }
                      } else {
                        setAvatarSeed(profile.username);
                      }
                      setIsEditing(true);
                    }}
                    className="absolute bottom-1 right-1 bg-primary hover:bg-primary/95 text-white rounded-full p-2.5 shadow-lg transition-all hover:scale-110 cursor-pointer border-2 border-card active:scale-95"
                    title="Change Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Text Information */}
              <div className="space-y-1.5 w-full">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-foreground tracking-tight leading-none">
                    {profile.name}
                  </h1>
                  <Badge className="bg-primary/15 text-primary border border-primary/25 capitalize px-2.5 py-0.5 font-bold text-[10px] tracking-wider rounded-full shadow-sm">
                    {profile.role || 'Member'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground font-medium pt-0.5">
                  <p className="flex items-center gap-1 font-semibold text-foreground/80">
                    <AtSign className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    {profile.username}
                  </p>
                  {profile.penName && (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                      <Feather className="w-3 h-3 shrink-0" />
                      {profile.penName}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full pt-1">
                {!isOwnProfile ? (
                  <Button
                    onClick={handleFollowToggle}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 transition-all shadow-md border rounded-xl py-2 text-xs sm:text-sm font-bold h-10 cursor-pointer active:scale-95",
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
                ) : (
                  <Button
                    onClick={() => {
                      setName(profile.name);
                      setUsernameInput(profile.username);
                      setBio(profile.bio || '');
                      setPenName(profile.penName || '');
                      setAvatar(profile.avatar || '');
                      setBannerImage(profile.bannerImage || '');
                      if (profile.avatar && profile.avatar.includes('api.dicebear.com')) {
                        try {
                          const url = new URL(profile.avatar);
                          const pathParts = url.pathname.split('/');
                          const style = pathParts[2];
                          const seedParam = url.searchParams.get('seed');
                          if (style) setAvatarStyle(style);
                          if (seedParam) setAvatarSeed(seedParam);
                        } catch (e) {
                          setAvatarSeed(profile.username);
                        }
                      } else {
                        setAvatarSeed(profile.username);
                      }
                      setIsEditing(true);
                    }}
                    variant="outline"
                    className="w-full border-glass-border text-foreground hover:bg-secondary/50 flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold h-10 cursor-pointer transition-all active:scale-95"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* 2. Middle Column: About Info & Bio */}
            <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-x border-glass-border/60 pt-4 lg:pt-0 lg:px-6 space-y-4">
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground/80 mb-2.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> About & Bio
                </h3>
                
                {profile.bio ? (
                  <div className="relative bg-secondary/15 p-3.5 rounded-2xl border border-glass-border/40 font-sans italic text-xs sm:text-sm text-foreground/90 leading-relaxed shadow-inner">
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />
                    "{profile.bio}"
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-secondary/10 p-3 rounded-2xl border border-glass-border/30">No bio added yet.</p>
                )}
              </div>

              <div className="space-y-2.5 text-xs pt-1">
                <div className="flex items-center gap-2 text-muted-foreground/80">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-bold text-foreground">Member Since:</span>
                  <span>{profile.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'Recently'}</span>
                </div>

                {/* Follower Stats Chips */}
                <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                  <div onClick={handleOpenFollowers} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-all text-xs shadow-sm hover:scale-102">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-extrabold text-foreground text-sm leading-none">{profile.followersCount || 0}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Followers</span>
                  </div>
                  <div onClick={handleOpenFollowing} className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-accent/10 border border-accent/20 cursor-pointer hover:bg-accent/20 transition-all text-xs shadow-sm hover:scale-102">
                    <Users className="w-4 h-4 text-accent shrink-0" />
                    <span className="font-extrabold text-foreground text-sm leading-none">{profile.followingCount || 0}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Right Column: Achievements & Reading Badges */}
            <div className="lg:col-span-4 flex flex-col space-y-3.5 border-t lg:border-t-0 border-glass-border/60 pt-4 lg:pt-0 lg:pl-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Achievements
                </h3>
                <div className="flex items-center gap-1.5 bg-success/15 border border-success/30 px-3 py-1 rounded-full text-xs shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="font-extrabold text-foreground">{profile.booksRead || 0}</span>
                  <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider">Books Read</span>
                </div>
              </div>

              {/* Achievements Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {calculatedAchievements.map((badge) => (
                  <div
                    key={badge.id}
                    className={cn(
                      "p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-200",
                      badge.unlocked
                        ? "bg-secondary/35 border-glass-border/60 shadow-sm hover:scale-102 hover:border-primary/30"
                        : "bg-black/5 dark:bg-white/5 border-dashed border-glass-border/40 opacity-45"
                    )}
                  >
                    <div className={cn(
                      "w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                      badge.unlocked ? "bg-amber-500/15 text-amber-500 border border-amber-500/25" : "bg-secondary/40 text-muted-foreground"
                    )}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-extrabold truncate text-foreground leading-none">{badge.name}</p>
                      <span className={cn(
                        "text-[9px] font-bold truncate block mt-1",
                        badge.unlocked ? "text-success" : "text-muted-foreground"
                      )}>
                        {badge.unlocked ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* ── Main Tab Navigation & Content ── */}
      <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 px-1 max-w-5xl mx-auto">
        {/* Tab Navigation header */}
        <div className="flex bg-secondary/35 p-1 rounded-full gap-1 w-fit max-w-full overflow-x-auto scrollbar-none border border-glass-border/30">
          <button
            onClick={() => setActiveTab('posts')}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95",
              activeTab === 'posts'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookMarked className="w-3.5 h-3.5" /> Activity Feed ({totalPostsCount})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95",
                activeTab === 'saved'
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className="w-3.5 h-3.5" /> Bookmarks
            </button>
          )}
          <button
            onClick={() => setActiveTab('library')}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95",
              activeTab === 'library'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" /> Library Collection
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-full transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95",
              activeTab === 'works'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Feather className="w-3.5 h-3.5" /> Published Writings ({userWorks.length})
          </button>
        </div>

        <div className="mt-4">
          {/* ── Tab: Posts ── */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {/* Visibility Filter Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-secondary/15 rounded-2xl border border-glass-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Filter Posts:
                </span>
                <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-glass-border/30 gap-1 text-xs">
                  {[
                    { value: 'ALL', label: 'All Visibilities' },
                    { value: 'PUBLIC', label: 'Public', icon: Globe },
                    { value: 'FOLLOWERS', label: 'Followers', icon: Users },
                    { value: 'PRIVATE', label: 'Private', icon: Lock },
                  ].map((vOpt) => (
                    <button
                      key={vOpt.value}
                      onClick={() => {
                        setPostVisibilityFilter(vOpt.value);
                        setPostsPage(1);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 text-[11px] cursor-pointer",
                        postVisibilityFilter === vOpt.value
                          ? "bg-card text-primary font-bold shadow-sm border border-glass-border"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {vOpt.icon && <vOpt.icon className="w-3 h-3 shrink-0" />}
                      <span>{vOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-6 text-muted-foreground">
                  <BookMarked className="w-8 h-8 mx-auto mb-2 text-muted-foreground/45" />
                  <p className="font-semibold text-sm">No activity found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">No posts match the selected visibility filter.</p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                      onUpdate={handlePostUpdate}
                    />
                  ))}

                  {/* Profile Posts Pagination Controls */}
                  {totalPostsPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-glass-border pt-4 px-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postsPage <= 1 || isLoadingPosts}
                        onClick={() => setPostsPage((p) => Math.max(1, p - 1))}
                        className="rounded-xl text-xs font-semibold gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>

                      <span className="text-xs font-bold text-muted-foreground">
                        Page {postsPage} of {totalPostsPages} ({totalPostsCount} posts)
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={postsPage >= totalPostsPages || isLoadingPosts}
                        onClick={() => setPostsPage((p) => Math.min(totalPostsPages, p + 1))}
                        className="rounded-xl text-xs font-semibold gap-1 cursor-pointer"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
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
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                      onUpdate={handlePostUpdate}
                    />
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            <Badge className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-md">
                              {entry.shelfType}
                            </Badge>
                            {entry.rating > 0 && (
                              <span className="text-xs text-amber-500 font-semibold flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                                {entry.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Published Works ── */}
            {activeTab === 'works' && (
              <div>
                {isLoadingWorks ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : userWorks.length === 0 ? (
                  <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-glass-border p-6 text-muted-foreground">
                    <Feather className="w-8 h-8 mx-auto mb-2 text-muted-foreground/45" />
                    <p className="font-semibold text-sm">No writings published</p>
                    <p className="text-xs text-muted-foreground mt-0.5">This author hasn't published any stories, poems, or blogs yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userWorks.map((work) => (
                      <Card
                        key={work._id}
                        className="bg-card/85 glass-card rounded-2xl border border-glass-border p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Badge className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none px-2 py-0.5 rounded-md">
                                {work.contentType}
                              </Badge>
                              {work.language && (
                                <Badge variant="outline" className="text-[10px] font-semibold border-glass-border px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                  <Languages className="w-3 h-3 text-primary" /> {work.language}
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {work.stats?.totalWordCount || 0} words
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm font-display text-foreground line-clamp-2 leading-snug">
                            {work.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 font-sans">
                            {work.summary || (work.chapters && work.chapters[0]?.content ? work.chapters[0].content.slice(0, 80) : '')}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-glass-border flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                            <Eye className="w-3.5 h-3.5 text-primary" /> {work.stats?.views || 0}
                          </span>
                          <Link
                            to={`/read/${work._id}`}
                            className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors"
                          >
                            Read Work →
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* ── EDIT PROFILE OVERLAY MODAL ── */}
      <Modal
        open={isEditing}
        onClose={handleCancel}
        title="Edit Profile"
        description="Update your public profile details and custom avatar"
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 mt-3">
          {/* Name + Username row - stacks on mobile */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Display Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-glass-border focus:ring-primary bg-secondary/15 rounded-xl h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-username" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <AtSign className="w-4 h-4" />
                </span>
                <Input
                  id="profile-username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="username"
                  className="pl-9 border-glass-border focus:ring-primary bg-secondary/15 rounded-xl h-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="profile-bio" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Biography</Label>
              <span className="text-[10px] text-muted-foreground">{bio.length}/500</span>
            </div>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other readers about yourself..."
              className="w-full min-h-[70px] sm:min-h-[90px] rounded-xl border border-glass-border bg-secondary/15 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
              maxLength={500}
            />
          </div>

          {/* Pen Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-penname" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Poet / Writer Pen Name</Label>
            <Input
              id="profile-penname"
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="Your Pen Name / Pseudonym (e.g. Ghalib)"
              className="border-glass-border focus:ring-primary bg-secondary/15 rounded-xl h-10"
              maxLength={100}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 pl-0.5">
              This pen name will be displayed as the signature on your published poems/quotes instead of your username.
            </p>
          </div>

          {/* DiceBear Avatar Generator section */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avatar Customization</Label>
            {/* Always stacked column — side by side only on sm+ */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-3 sm:p-4 border border-glass-border bg-secondary/5 rounded-xl">
              {/* Preview Avatar */}
              <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 shrink-0 w-full sm:w-auto">
                <div className="relative rounded-full border-4 border-background shadow-md overflow-hidden h-16 w-16 sm:h-20 sm:w-20">
                  <Avatar src={avatar} name={name} size="xl" className="h-full w-full text-2xl" />
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Preview</span>
                  {/* Upload button right next to avatar on mobile */}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSaving}
                    variant="outline"
                    className="sm:hidden mt-1 border-glass-border text-foreground hover:bg-secondary/40 flex items-center gap-1 rounded-lg text-[10px] h-7 cursor-pointer px-2"
                  >
                    <Camera className="w-3 h-3" /> Upload
                  </Button>
                </div>
              </div>

              {/* Picker controls */}
              <div className="flex-1 w-full space-y-3">
                {/* Upload option — hidden on mobile (button shown inline above) */}
                <div className="hidden sm:block space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Option 1: Upload Custom File</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isSaving}
                      variant="outline"
                      className="border-glass-border text-foreground hover:bg-secondary/40 flex items-center gap-1 rounded-xl text-[11px] h-8 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Choose Image
                    </Button>
                    <span className="text-[10px] text-muted-foreground">JPG, PNG, GIF files</span>
                  </div>
                </div>

                <div className="hidden sm:block h-px bg-glass-border" />

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Generate Avatar Style</span>
                  {/* Style thumbnails: 6 col always since they are compact */}
                  <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                    {AVATAR_STYLES.map((style) => {
                      const styleUrl = `https://api.dicebear.com/9.x/${style.id}/svg?seed=${encodeURIComponent(avatarSeed || 'preview')}&backgroundColor=ffdfbf`;
                      const isSelected = avatarStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setAvatarStyle(style.id);
                            const url = `https://api.dicebear.com/9.x/${style.id}/svg?seed=${encodeURIComponent(avatarSeed || 'preview')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5cc,ffdfbf`;
                            setAvatar(url);
                          }}
                          className={cn(
                            "relative p-1 rounded-lg border-2 transition-all hover:scale-105 flex flex-col items-center gap-0.5 bg-background cursor-pointer",
                            isSelected ? "border-primary shadow-sm bg-primary/5" : "border-glass-border hover:border-muted-foreground"
                          )}
                        >
                          <img src={styleUrl} alt={style.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                          <span className="text-[7px] sm:text-[8px] font-semibold text-foreground/80">{style.name}</span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                              <Check className="w-2 h-2" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Seed control */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="avatar-seed-modal" className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Avatar Seed</Label>
                      <Input
                        id="avatar-seed-modal"
                        value={avatarSeed}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAvatarSeed(val);
                          const url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${encodeURIComponent(val || 'preview')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5cc,ffdfbf`;
                          setAvatar(url);
                        }}
                        placeholder="Type seed (e.g. name)"
                        className="h-8 border-glass-border focus:ring-primary bg-secondary/15 rounded-lg text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleShuffleAvatar}
                      variant="outline"
                      className="h-8 px-2.5 text-xs border-glass-border text-foreground hover:bg-secondary/40 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      Shuffle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Banner Image Customization Section */}
          <div className="space-y-2 pt-3 border-t border-glass-border">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cover Banner</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-start p-3 sm:p-4 border border-glass-border bg-secondary/5 rounded-xl">
              {/* Preview Banner - shorter on mobile */}
              <div className="w-full sm:w-2/5 h-16 sm:aspect-[3/1] sm:h-auto rounded-lg sm:rounded-xl overflow-hidden border border-glass-border shrink-0 relative bg-muted flex items-center justify-center">
                {bannerImage ? (
                  <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-accent/20 flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Default Gradient</span>
                  </div>
                )}
                {isUploadingBanner && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1 w-full space-y-3">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Upload Cover Banner</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isUploadingBanner || isSaving}
                    variant="outline"
                    className="border-glass-border text-foreground hover:bg-secondary/40 flex items-center gap-1.5 rounded-xl text-[11px] h-8 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Choose Image
                  </Button>
                  {bannerImage && (
                    <Button
                      type="button"
                      onClick={() => setBannerImage('')}
                      variant="outline"
                      className="border-red-200 text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 rounded-xl text-[11px] h-8 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Recommended ratio: 3:1. Max size: 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t border-glass-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || isUploading || isUploadingBanner}
              className="border-glass-border text-foreground hover:bg-secondary/40 flex items-center gap-1 rounded-xl text-xs h-9 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading || isUploadingBanner}
              className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-1 rounded-xl text-xs h-9"
            >
              {isSaving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : (
                <><Check className="w-3.5 h-3.5" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Followers Modal */}
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

      {/* Following Modal */}
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
