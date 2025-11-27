const { Data, User, Link } = require('../database/models');
const moment = require('moment');

class StatsCalculator {
  
  // Calculate overall system statistics
  async getSystemStats() {
    try {
      const totalUsers = await User.countDocuments({ is_active: true });
      const totalData = await Data.countDocuments();
      const totalLinks = await Link.countDocuments({ is_active: true });
      
      const premiumUsers = await User.countDocuments({ 
        role: 'premium', 
        is_active: true 
      });
      
      const today = moment().startOf('day');
      const dataToday = await Data.countDocuments({
        timestamp: { $gte: today.toDate() }
      });
      
      const usersToday = await User.countDocuments({
        last_active: { $gte: today.toDate() }
      });

      return {
        totalUsers,
        premiumUsers,
        memberUsers: totalUsers - premiumUsers,
        totalData,
        dataToday,
        usersToday,
        totalLinks,
        dataPerUser: totalUsers > 0 ? (totalData / totalUsers).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error calculating system stats:', error);
      return null;
    }
  }

  // Calculate user-specific statistics
  async getUserStats(userId) {
    try {
      const user = await User.findOne({ user_id: userId });
      if (!user) return null;

      const userDataCount = await Data.countDocuments({ user_id: userId });
      const userLinks = await Link.find({ user_id: userId, is_active: true });
      
      const today = moment().startOf('day');
      const dataToday = await Data.countDocuments({
        user_id: userId,
        timestamp: { $gte: today.toDate() }
      });

      const totalClicks = userLinks.reduce((sum, link) => sum + link.click_count, 0);
      const totalDataFromLinks = userLinks.reduce((sum, link) => sum + link.data_collected, 0);

      return {
        userRole: user.role,
        joinDate: user.join_date,
        dataCollected: userDataCount,
        dataToday,
        linksShared: user.links_shared,
        activeLinks: userLinks.length,
        totalClicks,
        totalDataFromLinks,
        lastActive: user.last_active
      };
    } catch (error) {
      console.error('Error calculating user stats:', error);
      return null;
    }
  }

  // Calculate growth statistics
  async getGrowthStats(days = 7) {
    try {
      const startDate = moment().subtract(days, 'days').startOf('day');
      
      const newUsers = await User.countDocuments({
        join_date: { $gte: startDate.toDate() }
      });
      
      const newData = await Data.countDocuments({
        timestamp: { $gte: startDate.toDate() }
      });
      
      const dailyBreakdown = [];
      
      for (let i = 0; i < days; i++) {
        const date = moment().subtract(i, 'days').startOf('day');
        const nextDate = moment(date).add(1, 'day');
        
        const dailyUsers = await User.countDocuments({
          join_date: { $gte: date.toDate(), $lt: nextDate.toDate() }
        });
        
        const dailyData = await Data.countDocuments({
          timestamp: { $gte: date.toDate(), $lt: nextDate.toDate() }
        });
        
        dailyBreakdown.unshift({
          date: date.format('DD/MM'),
          users: dailyUsers,
          data: dailyData
        });
      }

      return {
        period: `${days} days`,
        newUsers,
        newData,
        dailyBreakdown,
        averageUsersPerDay: (newUsers / days).toFixed(1),
        averageDataPerDay: (newData / days).toFixed(1)
      };
    } catch (error) {
      console.error('Error calculating growth stats:', error);
      return null;
    }
  }

  // Get top performers
  async getTopPerformers(limit = 5) {
    try {
      const topUsers = await User.find({ is_active: true })
        .sort({ data_collected: -1 })
        .limit(limit);
      
      const topLinks = await Link.find({ is_active: true })
        .sort({ data_collected: -1 })
        .limit(limit);

      return {
        topUsers: topUsers.map(user => ({
          user_id: user.user_id,
          data_collected: user.data_collected,
          links_shared: user.links_shared,
          role: user.role
        })),
        topLinks: topLinks.map(link => ({
          link_code: link.link_code,
          data_collected: link.data_collected,
          click_count: link.click_count,
          link_type: link.link_type
        }))
      };
    } catch (error) {
      console.error('Error getting top performers:', error);
      return null;
    }
  }
}

module.exports = new StatsCalculator();