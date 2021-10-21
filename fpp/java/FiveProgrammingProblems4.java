package sample;

import java.math.BigInteger;

public class FiveProgrammingProblems4 {

  /**
   * main.
   * 
   * @param args arguments
   */
  public static void main(String[] args) {
    int[] nums = {50, 2, 1, 9};
    FiveProgrammingProblems4 problem4 = new FiveProgrammingProblems4();
    BigInteger max = problem4.max(nums);
    System.out.println(max);
  }

  private BigInteger max = BigInteger.ZERO;

  private BigInteger max(int[] nums) {
    int[] l = {};
    int[] r = nums;
    max = BigInteger.ZERO;
    problem4(l, r);
    return max;
  }

  private void problem4(int[] l, int[] r) {
    if (r.length == 0) {
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < l.length; i++) {
        sb.append(l[i]);
      }
      BigInteger bi = new BigInteger(sb.toString());
      if (max.compareTo(bi) < 0) {
        max = bi;
      }
    } else {
      for (int i = 0; i < r.length; i++) {
        int[] nl = new int[l.length + 1];
        int[] nr = new int[r.length - 1];
        for (int j = 0; j < l.length; j++) {
          nl[j] = l[j];
        }
        for (int j = 0; j < r.length; j++) {
          if (i < j) {
            nr[j - 1] = r[j];
          } else if (i > j) {
            nr[j] = r[j];
          } else {
            nl[nl.length - 1] = r[j];
          }
        }
        problem4(nl, nr);
      }
    }
  }
}
