package sample;

import java.math.BigInteger;
import java.util.Arrays;

public class FiveProgrammingProblems3 {

  /**
   * main.
   * 
   * @param args arguments
   */
  public static void main(String[] args) {
    System.out.println(Arrays.toString(problem3()));
  }

  private static BigInteger[] problem3() {
    BigInteger[] fnums = new BigInteger[101];
    fnums[0] = BigInteger.ZERO;
    fnums[1] = BigInteger.ONE;
    for (int i = 2; i < fnums.length; i++) {
      fnums[i] = fnums[i - 2].add(fnums[i - 1]);
    }
    return fnums;
  }
}
