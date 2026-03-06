class Main {
    public static void main(String[] args) {
        String s = "A man, a plan, a canal: Panama";
        StringBuilder sb = new StringBuilder("");
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (65 <= ch && ch <= 90) {
                sb.append(Character.toLowerCase(ch));
            } else if (97 <= ch && ch <= 122) {
                sb.append(ch);
            }
        }

        int a = 0;
        int b = sb.length() - 1;

        System.out.println(sb);
        while (a <= b) {
            if (sb.charAt(a) == sb.charAt(b)) {
                a++;
                b--;
            } else {
                System.out.println(false);
                break;
            }
        }

        System.out.println(true);

    }
}
