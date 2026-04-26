export async function attachUsersToTransactions({
  supabase,
  transactionsData = [],
  currentUserId,
}) {
  const userIds = [
    ...new Set(transactionsData.map((tx) => tx.user_id).filter(Boolean)),
  ];

  if (userIds.length === 0) {
    return transactionsData;
  }
  console.log(userIds);

  const { data: profilesData, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  if (error) {
    console.error(error.message);
    return transactionsData;
  }

  return transactionsData.map((tx) => {
    const profile = profilesData?.find((p) => p.id === tx.user_id);
    console.log(
      tx.user_id,
      currentUserId,
      "---",
      tx.user_id === currentUserId,
      profilesData,
    );

    return {
      ...tx,
      profiles: profile || null,
      displayUserName:
        tx.user_id === currentUserId
          ? profile?.full_name + " (You)"
          : profile?.full_name || "Unknown User",
    };
  });
}
