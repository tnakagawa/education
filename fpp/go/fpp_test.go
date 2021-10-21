package go_test

import (
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
	"testing"
)

func TestProblem1(t *testing.T) {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	fmt.Println(problem1For(nums))
	fmt.Println(problem1While(nums))
	fmt.Println(problem1Recursion(nums))
}

func problem1For(nums []int) int {
	t := 0
	for _, v := range nums {
		t += v
	}
	return t
}

func problem1While(nums []int) int {
	ret := 0
	tmp := make([]int, len(nums))
	copy(tmp, nums)
	for len(tmp) > 0 {
		ret += tmp[0]
		tmp = tmp[1:]
	}
	return ret
}

func problem1Recursion(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	return nums[0] + problem1Recursion(nums[1:])
}

func TestProblem2(t *testing.T) {
	a := []int{1, 2, 3}
	b := []string{"a", "b", "c"}
	fmt.Println(problem2(a, b))
}

func problem2(a []int, b []string) []interface{} {
	c := make([]interface{}, 0)
	len := int(math.Max(float64(len(a)), float64(len(b))))
	for i := 0; i < len; i++ {
		c = append(c, a[i])
		c = append(c, b[i])
	}
	return c
}

func TestProblem3(t *testing.T) {
	fmt.Println(problem3())
}

func problem3() []*big.Int {
	fnums := []*big.Int{big.NewInt(0), big.NewInt(1)}
	for i := 0; i < 99; i++ {
		fnums = append(fnums, new(big.Int).Add(fnums[i], fnums[i+1]))
	}
	return fnums
}

var max int = 0

func TestProblem4(t *testing.T) {
	left := []int{}
	right := []int{50, 2, 1, 9}
	max = 0
	problem4(left, right)
	fmt.Println(max)
}

func problem4(left []int, right []int) {
	if len(right) == 0 {
		str := ""
		for _, v := range left {
			str += strconv.Itoa(v)
		}
		tmp, _ := strconv.Atoi(str)
		if tmp > max {
			max = tmp
		}
	} else {
		for i, v := range right {
			newLeft := make([]int, len(left))
			copy(newLeft, left)
			newRight := make([]int, len(right))
			copy(newRight, right)
			newLeft = append(newLeft, v)
			newRight = append(newRight[:i], newRight[i+1:]...)
			problem4(newLeft, newRight)
		}

	}
}

func TestProblem5(t *testing.T) {
	problem5([]string{})
}

var NUMS = []string{"1", "2", "3", "4", "5", "6", "7", "8", "9"}
var KIGO = []string{"", " +", " -"}
var GOAL = 100

func problem5(strs []string) {
	if len(strs)+1 == len(NUMS) {
		str := ""
		for i, n := range NUMS {
			str += n
			if i < len(strs) {
				str += strs[i]
			}
		}
		strs := strings.Split(str, " ")
		ret := 0
		for _, v := range strs {
			i, _ := strconv.Atoi(v)
			ret += i
		}
		if ret == GOAL {
			fmt.Println(str)
		}
	} else {
		for _, k := range KIGO {
			newStrs := make([]string, len(strs))
			copy(newStrs, strs)
			newStrs = append(newStrs, k)
			problem5(newStrs)
		}
	}
}
