package sample;

import java.math.BigInteger;

public class FiveProgrammingProblems5 {

  /**
   * main.
   * 
   * @param args arguments
   */
  public static void main(String[] args) {
    problem5(new String[] {});
  }

  private static final String[] NUMS = {"1", "2", "3", "4", "5", "6", "7", "8", "9"};
  private static final String[] KIGO = {"", " +", " -"};
  private static final BigInteger GOAL = new BigInteger("100");

  private static void problem5(String[] strs) {
    if (strs.length + 1 == NUMS.length) {
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < NUMS.length; i++) {
        sb.append(NUMS[i]);
        if (i < strs.length) {
          sb.append(strs[i]);
        }
      }
      BigInteger ret = BigInteger.ZERO;
      String[] items = sb.toString().split(" ");
      for (int i = 0; i < items.length; i++) {
        ret = ret.add(new BigInteger(items[i]));
      }
      if (ret.compareTo(GOAL) == 0) {
        System.out.println(sb.toString());
      }
    } else {
      for (int i = 0; i < KIGO.length; i++) {
        String[] nstrs = new String[strs.length + 1];
        System.arraycopy(strs, 0, nstrs, 0, strs.length);
        nstrs[nstrs.length - 1] = KIGO[i];
        problem5(nstrs);
      }
    }
  }
}
