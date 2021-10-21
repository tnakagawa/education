package sample;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FiveProgrammingProblems2 {

  /**
   * main.
   * 
   * @param args arguments
   */
  public static void main(String[] args) {
    Object[] a = new Object[] {1, 2, 3};
    Object[] b = new Object[] {"a", "b", "c"};
    System.out.println(Arrays.toString(problem2(a, b)));
  }

  private static Object[] problem2(Object[] a, Object[] b) {
    List<Object> c = new ArrayList<Object>();
    int max = Math.max(a.length, b.length);
    for (int i = 0; i < max; i++) {
      if (a.length > i) {
        c.add(a[i]);
      }
      if (b.length > i) {
        c.add(b[i]);
      }
    }
    return c.toArray(new Object[a.length + b.length]);
  }
}
