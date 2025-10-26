const { prisma } = require("../../prisma/client");

// to get the current logged in user
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        posts: true,
        comments: true,
        likes: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// update user profile

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName },
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// get user by id ( to view other public profiles)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        posts: true,
        comments: true,
        likes: true,
        followers: {
          select: {
            follower: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
        following: {
          select: {
            following: {
              select: {
                id: true,
                firstName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// follow a user

exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;
    // this user id is of the user we want to follow

    if (followerId === parseInt(userId)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId),
        },
      },
    });
    if (existingFollow) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: parseInt(userId),
      },
    });

    res.json({ message: "User followed successfully", follow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// unfollow a user

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;
    // user we want to unfollow

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId),
        },
      },
    });
    if (!existingFollow) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId),
        },
      },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// get followers of a user

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(userId) },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// get following of a user

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await prisma.follow.findMany({
      where: { followerId: parseInt(userId) },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
