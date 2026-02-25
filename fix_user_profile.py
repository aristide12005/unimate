import os

target_file = "src/pages/UserProfileScreen.tsx"
with open(target_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = lines[:186] # Up to Line 186 (0-indexed 185, which is just before {/* Bio */})

correct_tail = """
                {/* Bio */}
                {author.bio && (
                    <div className="mt-4">
                        <p className="text-gray-600 leading-relaxed">
                            {author.bio}
                        </p>
                    </div>
                )}

                {/* Additional Details Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {author.school_company && (
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Occupation</p>
                            <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                                {typeof author.school_company === 'string' ? author.school_company : JSON.stringify(author.school_company)}
                            </p>
                        </div>
                    )}
                    {author.lifestyle && (
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Lifestyle</p>
                            <p className="font-semibold text-gray-800 text-sm">
                                {typeof author.lifestyle === 'string' ? author.lifestyle : JSON.stringify(author.lifestyle)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Interests & Languages */}
                {(author.interests || author.languages) && (
                    <div className="mt-6 space-y-4">
                        {author.interests && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-2">Interests</p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(author.interests) ? author.interests.map((interest: any, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                                            {typeof interest === 'string' ? interest : JSON.stringify(interest)}
                                        </span>
                                    )) : (
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                                            {typeof author.interests === 'string' ? author.interests : JSON.stringify(author.interests)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {author.languages && (
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-2">Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(author.languages) ? author.languages.map((lang: any, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-medium">
                                            {typeof lang === 'string' ? lang : JSON.stringify(lang)}
                                        </span>
                                    )) : (
                                        <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-medium">
                                            {typeof author.languages === 'string' ? author.languages : JSON.stringify(author.languages)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Places Listings Link */}
                <button
                    onClick={() => navigate(`/user/${author.id}/places`)}
                    className="mt-6 w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                    <span className="font-bold text-gray-900 text-lg">Places Listings</span>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>

            </div>

            {/* ─── Bottom Action Bar ─── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 safe-area-bottom z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <span className="text-xl font-bold text-gray-900">{author.name}</span>
                {profile && profile.id === id ? (
                    <button
                        disabled
                        className="bg-gray-200 text-gray-400 px-8 py-3 rounded-full font-bold flex items-center gap-2 cursor-not-allowed"
                    >
                        <MessageCircle size={20} fill="currentColor" />
                        Message
                    </button>
                ) : (
                    <button
                        onClick={() => navigate(`/chat/${author.id}`)}
                        className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors active:scale-95"
                    >
                        <MessageCircle size={20} fill="currentColor" />
                        Message
                    </button>
                )}
            </div>

            {/* Report Dialog */}
            {profile && (
                <ReportUserDialog
                    isOpen={isReportDialogOpen}
                    onClose={() => setIsReportDialogOpen(false)}
                    reportedUserId={profile.id}
                    reportedUserName={profile.name}
                />
            )}
        </div>
    );
};

export default UserProfileScreen;
"""

with open(target_file, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
    f.write(correct_tail)

print("Fixed UserProfileScreen!")
