import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  MapPin,
  Globe,
  Briefcase,
  Lock,
  UserX,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

interface PublicUserProfileProps {
  username: string;
}

export default function PublicUserProfile({ username }: PublicUserProfileProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/users", username, "public-profile"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}/public-profile`);
      if (!res.ok) {
        const body = await res.json();
        throw Object.assign(new Error(body.error || "Not found"), { status: res.status, isPrivate: body.isPrivate });
      }
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    const isPrivate = (error as any).isPrivate;
    const notFound = (error as any).status === 404;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            {isPrivate ? (
              <Lock className="h-10 w-10 text-gray-400" />
            ) : (
              <UserX className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isPrivate ? "Private Profile" : notFound ? "User Not Found" : "Profile Unavailable"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {isPrivate
              ? `@${username} has set their profile to private.`
              : notFound
              ? `No user with the username @${username} was found.`
              : "This profile is currently unavailable."}
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  if (!profile) return null;

  const initials = profile.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile.username || "?").slice(0, 2).toUpperCase();

  const skills: string[] = Array.isArray(profile.skills) ? profile.skills : [];
  const socialLinks: Record<string, string> = profile.socialLinks || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              WytNet
            </Button>
          </Link>
          <span className="text-sm text-gray-500 dark:text-gray-400">Public Profile</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Profile header card */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600" />

          <CardContent className="pt-0 pb-6 px-6">
            {/* Avatar */}
            <div className="-mt-12 mb-4">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName || profile.username}
                  className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {initials}
                </div>
              )}
            </div>

            {/* Name & username */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
              {profile.nickName && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">"{profile.nickName}"</p>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{profile.bio}</p>
            )}

            {/* Meta info row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {(profile.jobTitle || profile.company) && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {[profile.jobTitle, profile.company].filter(Boolean).join(" at ")}
                </span>
              )}
              {(profile.city || profile.location) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.city || profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Social links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge variant="outline" className="capitalize hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        {platform}
                      </Badge>
                    </a>
                  ) : null
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* WytWall public indicator */}
        {profile.wytwall && (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profile.username}'s WytWall posts are public
            </p>
          </div>
        )}

        {/* Member of WytNet */}
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Member of{" "}
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              WytNet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
