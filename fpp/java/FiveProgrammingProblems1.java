package sample;

public class FiveProgrammingProblems1 {

  /**
   * main.
   * 
   * @param args arguments
   */
  public static void main(String[] args) {
    int[] nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    System.out.println(problem1For(nums));
    System.out.println(problem1While(nums));
    System.out.println(problem1Recursion(nums));
  }

  private static int problem1For(int[] nums) {
    int sum = 0;
    for (int num : nums) {
      sum += num;
    }
    return sum;
  }

  private static int problem1While(int[] nums) {
    int sum = 0;
    int p = 0;
    while (nums.length > p) {
      sum += nums[p];
      p++;
    }
    return sum;
  }

  private static int problem1Recursion(int[] nums) {
    if (nums.length == 0) {
      return 0;
    }
    int[] tmp = new int[nums.length - 1];
    System.arraycopy(nums, 1, tmp, 0, tmp.length);
    return nums[0] + problem1Recursion(tmp);
  }

}
