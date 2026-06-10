public class SelfTest {
    public static void main(String[] args) {
        String expectedVersion = args[0];
        String javaVersion = System.getProperty("java.runtime.version");
        if (javaVersion.startsWith(expectedVersion)) {
            System.exit(0);
        } else {
            System.exit(1);
        }
    }
}